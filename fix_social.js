const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

// Update handleNetworkUpdate to accept an object of updates
const handleNetworkOld = `  const handleNetworkUpdate = (netId, key, value) => {
    const selBlock = findBlockInfo(blocks, selectedBlockId)?.block;
    if(!selBlock) return;
    const newNetworks = selBlock.content.networks.map(n => n.id === netId ? { ...n, [key]: value } : n);
    handleUpdateContent('networks', newNetworks);
  };`;

const handleNetworkNew = `  const handleNetworkUpdate = (netId, key, value) => {
    const selBlock = findBlockInfo(blocks, selectedBlockId)?.block;
    if(!selBlock) return;
    let newNetworks;
    if (typeof key === 'object') {
      newNetworks = selBlock.content.networks.map(n => n.id === netId ? { ...n, ...key } : n);
    } else {
      newNetworks = selBlock.content.networks.map(n => n.id === netId ? { ...n, [key]: value } : n);
    }
    handleUpdateContent('networks', newNetworks);
  };`;

code = code.replace(handleNetworkOld, handleNetworkNew);

// Update UI
const socialUIOld = `<span className="text-[10px] font-bold uppercase">{net.network}</span>`;
const socialUINew = `<select 
                                    value={net.network} 
                                    onChange={(e) => {
                                      const newNet = e.target.value;
                                      const defaultBg = SOCIAL_CONFIG[newNet].defaultBg;
                                      handleNetworkUpdate(net.id, { network: newNet, bgColor: defaultBg });
                                    }}
                                    className="text-[10px] font-bold uppercase bg-transparent outline-none cursor-pointer border-b border-dashed border-gray-400"
                                  >
                                    {Object.keys(SOCIAL_CONFIG).map(k => (
                                      <option key={k} value={k}>{SOCIAL_CONFIG[k].label}</option>
                                    ))}
                                  </select>`;

code = code.replace(socialUIOld, socialUINew);

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
console.log("Fixed social UI!");
