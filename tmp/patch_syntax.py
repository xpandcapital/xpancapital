
import sys

def patch_file():
    path = r"c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\app\superadmin\trading\TerminalLogic.tsx"
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the problematic block
    # Line 2320 is index 2319
    # Line 2321 is index 2320
    
    # We want to remove line 2320 (index 2319) and fix line 2321 (index 2320)
    # Actually, we need to find where the double brace happens.
    
    # Searching for:
    # 2320:                                                              }
    # 2321:                                                               } else if (...)
    
    # Also we need to add a closing brace before setManualStrategy.
    
    # Let's rewrite the whole chat block.
    # From line 2302 (index 2301) to line 2346 (index 2345).
    
    start_idx = 0
    for i, line in enumerate(lines):
        if 'if (prompt.toLowerCase().includes(\'sincronización total\')' in line:
            start_idx = i
            break
            
    end_idx = 0
    for i in range(start_idx, len(lines)):
        if 'setManualStrategy(prev => ({' in line: # wait, line is not updating in this loop fixed below
            pass
            
    # Better: find the setManualStrategy after start_idx
    for i in range(start_idx, len(lines)):
        if 'setManualStrategy(prev => ({' in lines[i]:
            # We want to find the end of that call
            for j in range(i, len(lines)):
                if '}));' in lines[j]:
                    end_idx = j
                    break
            break

    if start_idx and end_idx:
        new_block = [
            "                                                              if (prompt.toLowerCase().includes('sincronización total') || prompt.toLowerCase().includes('ajusta todos')) {\n",
            "                                                                  suggest = { \n",
            "                                                                      emaFast: 10, emaSlow: 30, rsiPeriod: 14, rsiBuy: 25, rsiSell: 75,\n",
            "                                                                      atrMultiplier: 2.5, tpRatio: 3.5, risk: 2, beTrigger: 15, beLock: 1, trailingDist: 20\n",
            "                                                                  };\n",
            "                                                                  text = \"Protocolo ACTIVADO. He ajustado las recomendaciones para alta volatilidad y gestión de capital agresiva (ver todas las etiquetas 'Ref'):\";\n",
            "                                                              } else if (prompt.toLowerCase().includes('scalping')) {\n",
            "                                                                  suggest = { \n",
            "                                                                      emaFast: 5, emaSlow: 13, rsiPeriod: 7, rsiBuy: 20, rsiSell: 80,\n",
            "                                                                      atrMultiplier: 1.0, tpRatio: 1.5, risk: 3, beTrigger: 5, beLock: 0, trailingDist: 10\n",
            "                                                                  };\n",
            "                                                                  text = \"Para Scalping, sugiero alta sensibilidad y TP corto (ver referencias 'Ref'):\";\n",
            "                                                              } else if (prompt.toLowerCase().includes('segur') || prompt.toLowerCase().includes('conservador')) {\n",
            "                                                                  suggest = { \n",
            "                                                                      emaFast: 25, emaSlow: 60, rsiPeriod: 21, rsiBuy: 45, rsiSell: 55,\n",
            "                                                                      atrMultiplier: 3.0, tpRatio: 5.0, risk: 1, beTrigger: 30, beLock: 5, trailingDist: 50\n",
            "                                                                  };\n",
            "                                                                  text = \"Para perfil conservador, sugiero filtros lentos y riesgo mínimo (ver referencias 'Ref'):\";\n",
            "                                                              } else if (prompt.toLowerCase().includes('stocastic') || prompt.toLowerCase().includes('estocástico')) {\n",
            "                                                                  suggest = { \n",
            "                                                                      emaFast: 14, emaSlow: 50, rsiPeriod: 14, rsiBuy: 30, rsiSell: 70,\n",
            "                                                                      stochK: 14, stochD: 3, stochOverbought: 92, stochOversold: 8,\n",
            "                                                                      atrMultiplier: 1.5, tpRatio: 2.5, risk: 2, beTrigger: 20, beLock: 2, trailingDist: 25\n",
            "                                                                  };\n",
            "                                                                  text = \"Configuración de Estocástico 92/8 ACTIVADA. He sincronizado las EMAs para confirmar la tendencia principal y asegurar entradas de alta precisión.\";\n",
            "                                                              }\n",
            "\n",
            "                                                              setManualStrategy(prev => ({\n",
            "                                                                  ...prev,\n",
            "                                                                  emaFast_suggest: suggest.emaFast,\n",
            "                                                                  emaSlow_suggest: suggest.emaSlow,\n",
            "                                                                  rsiPeriod_suggest: suggest.rsiPeriod,\n",
            "                                                                  rsiBuy_suggest: suggest.rsiBuy,\n",
            "                                                                  rsiSell_suggest: suggest.rsiSell,\n",
            "                                                                  stochK_suggest: suggest.stochK,\n",
            "                                                                  stochD_suggest: suggest.stochD,\n",
            "                                                                  stochOverbought_suggest: suggest.stochOverbought,\n",
            "                                                                  stochOversold_suggest: suggest.stochOversold,\n",
            "                                                                  atrMultiplier_suggest: suggest.atrMultiplier,\n",
            "                                                                  tpRatio_suggest: suggest.tpRatio,\n",
            "                                                                  risk_suggest: suggest.risk,\n",
            "                                                                  beTrigger_suggest: suggest.beTrigger,\n",
            "                                                                  beLock_suggest: suggest.beLock,\n",
            "                                                                  trailingDist_suggest: suggest.trailingDist\n",
            "                                                              }));\n"
        ]
        lines[start_idx:end_idx+1] = new_block
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Patched successfully")
    else:
        print(f"Indices not found: start={start_idx}, end={end_idx}")

if __name__ == "__main__":
    patch_file()
