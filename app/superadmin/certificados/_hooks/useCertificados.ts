"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { CertificateTemplate, CertificateElement } from "../_types";
import { createNewTemplate, dbToLocal, localToDb } from "../_types";

export function useCertificados(guard: (module: string, action: string) => boolean) {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "editor">("list");
  const [currentTemplate, setCurrentTemplate] = useState<CertificateTemplate | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasBounds, setCanvasBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/certificados/plantillas");
      const data = await response.json();
      if (data.success && data.data) {
        const localTemplates = data.data.map(dbToLocal);
        setTemplates(localTemplates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const syncBounds = useCallback(() => {
    if (canvasRef.current) {
      setCanvasBounds(canvasRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (view === "editor") {
      window.addEventListener("resize", syncBounds);
      syncBounds();
      return () => window.removeEventListener("resize", syncBounds);
    }
  }, [view, syncBounds]);

  const updateElement = useCallback((id: string, data: Partial<CertificateElement>) => {
    setCurrentTemplate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        elements: prev.elements.map(el => (el.id === id ? { ...el, ...data } : el)),
      };
    });
  }, []);

  const stopContinuousMove = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopContinuousMove();
  }, [stopContinuousMove]);

  const moveElement = useCallback(
    (dx: number, dy: number) => {
      if (!selectedId) return;
      setCurrentTemplate(prev => {
        if (!prev) return null;
        const el = prev.elements.find(e => e.id === selectedId);
        if (!el) return prev;
        const sensitivity = 0.2;
        return {
          ...prev,
          elements: prev.elements.map(e =>
            e.id === selectedId
              ? {
                  ...e,
                  x: Math.max(0, Math.min(100, e.x + dx * sensitivity)),
                  y: Math.max(0, Math.min(100, e.y + dy * sensitivity)),
                }
              : e
          ),
        };
      });
    },
    [selectedId]
  );

  const startContinuousMove = useCallback(
    (dx: number, dy: number) => {
      stopContinuousMove();
      moveElement(dx, dy);
      moveIntervalRef.current = setInterval(() => {
        moveElement(dx, dy);
      }, 16);
    },
    [moveElement, stopContinuousMove]
  );

  const startContinuousScale = useCallback(
    (delta: number) => {
      stopContinuousMove();
      if (!selectedId) return;
      const doScale = () => {
        setCurrentTemplate(prev => {
          if (!prev) return null;
          const el = prev.elements.find(e => e.id === selectedId);
          if (!el) return prev;
          return {
            ...prev,
            elements: prev.elements.map(e =>
              e.id === selectedId
                ? {
                    ...e,
                    fontSize: Math.max(10, Math.min(150, e.fontSize + delta)),
                  }
                : e
            ),
          };
        });
      };
      doScale();
      moveIntervalRef.current = setInterval(doScale, 40);
    },
    [selectedId, stopContinuousMove]
  );

  const handleDragStart = useCallback(
    (e: React.PointerEvent, el: CertificateElement) => {
      e.preventDefault();
      e.stopPropagation();
      syncBounds();
      setSelectedId(el.id);

      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();

      const initialCenterX = canvasRect.left + (el.x / 100) * canvasRect.width;
      const initialCenterY = canvasRect.top + (el.y / 100) * canvasRect.height;

      const offsetX = initialCenterX - e.clientX;
      const offsetY = initialCenterY - e.clientY;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const targetX = moveEvent.clientX + offsetX;
        const targetY = moveEvent.clientY + offsetY;

        let newX = ((targetX - canvasRect.left) / canvasRect.width) * 100;
        let newY = ((targetY - canvasRect.top) / canvasRect.height) * 100;

        newX = Math.max(0, Math.min(100, parseFloat(newX.toFixed(4))));
        newY = Math.max(0, Math.min(100, parseFloat(newY.toFixed(4))));

        if (Math.abs(newX - 50) < 0.8) newX = 50;
        if (Math.abs(newY - 50) < 0.8) newY = 50;

        updateElement(el.id, { x: newX, y: newY });
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [syncBounds, updateElement]
  );

  const handleCreateNew = useCallback(() => {
    if (!guard("certificados", "crear")) return;
    setCurrentTemplate(createNewTemplate());
    setSelectedId(null);
    setView("editor");
  }, [guard]);

  const handleEditTemplate = useCallback(
    (template: CertificateTemplate) => {
      if (!guard("certificados", "editar")) return;
      setCurrentTemplate(template);
      setSelectedId(null);
      setView("editor");
    },
    [guard]
  );

  const handleDeleteTemplate = useCallback(
    async (id: string) => {
      if (!guard("certificados", "eliminar")) return;
      if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return;
      try {
        const response = await fetch(`/api/certificados/plantillas?id=${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          fetchTemplates();
        }
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    },
    [guard, fetchTemplates]
  );

  const handleBgUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && currentTemplate) {
        const reader = new FileReader();
        reader.onload = ev => {
          setCurrentTemplate(prev => (prev ? { ...prev, backgroundImage: ev.target?.result as string } : null));
        };
        reader.readAsDataURL(file);
      }
    },
    [currentTemplate]
  );

  const saveProject = useCallback(async () => {
    if (!currentTemplate) return;
    setSaving(true);
    try {
      const dbData = localToDb(currentTemplate);
      const isNew = currentTemplate.id === "new";
      const response = await fetch("/api/certificados/plantillas", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? dbData : { id: currentTemplate.id, ...dbData }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTemplates();
        setView("list");
      } else {
        console.error("Error saving:", data.error);
        alert("Error al guardar: " + data.error);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error al guardar la plantilla");
    } finally {
      setSaving(false);
    }
  }, [currentTemplate, fetchTemplates]);

  const handleTitleChange = useCallback((title: string) => {
    setCurrentTemplate(prev => (prev ? { ...prev, title } : null));
  }, []);

  const handleSelectElement = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleDeselectElement = useCallback(() => {
    setSelectedId(null);
  }, []);

  return {
    templates,
    loading,
    saving,
    view,
    setView,
    currentTemplate,
    selectedId,
    canvasRef,
    canvasBounds,
    syncBounds,
    handleCreateNew,
    handleEditTemplate,
    handleDeleteTemplate,
    handleBgUpload,
    handleTitleChange,
    handleSelectElement,
    handleDeselectElement,
    saveProject,
    updateElement,
    moveElement,
    startContinuousMove,
    startContinuousScale,
    stopContinuousMove,
    handleDragStart,
  };
}
