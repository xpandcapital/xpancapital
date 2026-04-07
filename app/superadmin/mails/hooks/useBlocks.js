import { useState, useCallback } from 'react';

const getUniqueId = (prefix = 'block') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useBlocks(initialBlocks = []) {
  const [blocks, setBlocks] = useState(initialBlocks);

  const addBlock = useCallback((type, defaultContent, index) => {
    const newBlock = {
      id: getUniqueId(type),
      type,
      content: { ...defaultContent }
    };
    
    setBlocks(prev => {
      if (typeof index === 'number') {
        const newBlocks = [...prev];
        newBlocks.splice(index, 0, newBlock);
        return newBlocks;
      }
      return [...prev, newBlock];
    });
    
    return newBlock.id;
  }, []);

  const updateBlock = useCallback((id, content) => {
    setBlocks(prev => prev.map(block => 
      block.id === id 
        ? { ...block, content: { ...block.content, ...content } }
        : block
    ));
  }, []);

  const removeBlock = useCallback((id) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  const moveBlock = useCallback((id, direction) => {
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      
      const newBlocks = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
  }, []);

  const duplicateBlock = useCallback((id) => {
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index === -1) return prev;
      
      const block = prev[index];
      const newBlock = {
        ...block,
        id: getUniqueId(block.type),
        content: { ...block.content }
      };
      
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
  }, []);

  const setBlocksData = useCallback((data) => {
    setBlocks(data);
  }, []);

  const resetBlocks = useCallback(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  return {
    blocks,
    setBlocks: setBlocksData,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    duplicateBlock,
    resetBlocks
  };
}