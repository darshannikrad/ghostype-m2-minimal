const $ = id => document.getElementById(id); const result = $('result');
async function run(action) { result.textContent = 'Working…'; try { result.textContent = await action(); } catch (e) { result.textContent = `Error: ${e.message}`; } }
$('ask').onclick = () => { const p = $('prompt').value.trim(); if (p) run(() => window.ghostype.askText(p)); };
$('screen').onclick = () => run(() => window.ghostype.askScreen($('prompt').value.trim()));
$('hide').onclick = () => window.ghostype.hide();
$('prompt').addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('ask').click(); });
