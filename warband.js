// ... (todo o código anterior permanece igual exceto pelas funções de magias nos personagens)

// ===================== MAGIAS NOS PERSONAGENS =====================

// Só mago pode adicionar/remover magias
function renderAddMagiaPersonagem(idx) {
    if (personagens[idx]?.tipo !== "Mago") return "";
    let html = `<form class="add-magic-person-btn" onsubmit="return addMagiaPersonagem(${idx})">
        <select id="add-magia-person-${idx}">
            ${Object.keys(magiasPorEscola).sort().map(escola =>
                `<optgroup label="${escola}">`+
                magiasPorEscola[escola].map(m =>
                    `<option value="${escola}|${m.nome}">${m.nome} (Custo ${m.custo})</option>`
                ).join('')
                +'</optgroup>'
            ).join('')}
        </select>
        <button type="submit">Adicionar Magia</button>
    </form>`;
    return html;
}

window.addMagiaPersonagem = function(idx) {
    if (personagens[idx]?.tipo !== "Mago") return false;
    let sel = document.getElementById(`add-magia-person-${idx}`);
    let val = sel.value;
    if (!val) return false;
    let [escola, nome] = val.split('|');
    let magia = (magiasPorEscola[escola] || []).find(m => m.nome === nome);
    if (!magia) return false;
    if (!magiasPorPersonagem[idx]) magiasPorPersonagem[idx] = [];
    if (magiasPorPersonagem[idx].length >= 8) { alert("Limite de magias atingido!"); return false; }
    magiasPorPersonagem[idx].push(magia);
    renderPersonagens();
    return false;
};

function renderMagiasPersonagem(idx) {
    if (personagens[idx]?.tipo === "Mago") {
        let arr = magiasPorPersonagem[idx] || [];
        if (!arr.length) return `<div style="color:#aaa;font-size:.98em;">Nenhuma magia</div>`;
        return `<ul class="magic-list">${
            arr.map((m,i)=>`<li>${m.nome} (${m.escola}) <button class="remove-btn" onclick="removerMagiaPersonagem(${idx},${i})" title="Remover">✖</button></li>`).join('')
        }</ul>`;
    } else if (personagens[idx]?.tipo === "Aprendiz") {
        // Aprendiz mostra magias do mago
        let idxMago = personagens.findIndex(p => p.tipo === "Mago");
        if (idxMago === -1 || !magiasPorPersonagem[idxMago] || !magiasPorPersonagem[idxMago].length)
            return `<div style="color:#aaa;font-size:.98em;">Nenhuma magia</div>`;
        return `<ul class="magic-list">${
            magiasPorPersonagem[idxMago].map((m,i)=>`<li>${m.nome} (${m.escola})</li>`).join('')
        }</ul>`;
    } else {
        // Soldado nunca tem magias
        return "";
    }
}

window.removerMagiaPersonagem = function(idx, i) {
    if (personagens[idx]?.tipo !== "Mago") return;
    (magiasPorPersonagem[idx]||[]).splice(i,1);
    renderPersonagens();
};

// ========== NO CARDS DOS PERSONAGENS ==========

function personagemCard(pers, idx, displayOrder) {
    let tipoStr = pers.tipo;
    let stats = getStats(pers);
    let name = pers.nome || pers.tipoSoldado || "";
    // ... edição de nome omitido para clareza ...
    let nomeHtml;
    if (editandoNome === idx) {
        nomeHtml = `<form class="edit-name-form" onsubmit="return salvarNomePersonagem(${idx})">
            <input class="edit-name-input" id="edit-name-input-${idx}" type="text" value="${name.replace(/"/g,'&quot;')}" maxlength="40">
            <button class="edit-name-btn" type="submit" title="Salvar">💾</button>
            <button class="edit-name-cancel" type="button" onclick="cancelarEditarNome()">✖</button>
        </form>`;
        setTimeout(() => {
            let el = document.getElementById(`edit-name-input-${idx}`);
            if (el) { el.focus(); el.select(); }
        }, 0);
    } else {
        nomeHtml = `<span>${name ? ' - ' + name : ''}</span> <button class="edit-name-btn" type="button" onclick="editarNomePersonagem(${idx})" title="Editar nome">✎</button>`;
    }

    let moverBtns = "";
    if (pers.tipo === "Soldado") {
        let first = personagens.findIndex(p => p.tipo === "Soldado");
        let last = personagens.length-1 - [...personagens].reverse().findIndex(p => p.tipo === "Soldado");
        moverBtns = `
            <button class="move-btn" type="button" onclick="moverSoldado(${idx}, -1)" title="Subir" ${idx===first?'disabled':''}>↑</button>
            <button class="move-btn" type="button" onclick="moverSoldado(${idx}, 1)" title="Descer" ${idx===last?'disabled':''}>↓</button>
        `;
    }

    // Magias: apenas mago pode adicionar/remover, aprendiz só visualiza (espelha mago), soldado não tem
    let magiasSection = '';
    if (pers.tipo === "Mago") {
        magiasSection = `<div class="magic-section">
            <b>Magias:</b>
            ${renderAddMagiaPersonagem(idx)}
            ${renderMagiasPersonagem(idx)}
        </div>`;
    } else if (pers.tipo === "Aprendiz") {
        magiasSection = `<div class="magic-section">
            <b>Magias (as mesmas do mago):</b>
            ${renderMagiasPersonagem(idx)}
        </div>`;
    }

    // Itens (todos podem ter)
    let itensSection = `<div class="item-section">
        <b>Itens:</b>
        ${renderAddItemPersonagem(idx)}
        ${renderItensPersonagem(idx)}
    </div>`;

    return Object.assign(document.createElement('div'), {
        className: 'person-card',
        innerHTML: `
        <div class="person-header">
            ${tipoStr} ${nomeHtml}
            <button class="remove-btn" title="Remover" onclick="removerPersonagem(${idx})">✖</button>
            ${moverBtns}
        </div>
        <div class="stats-line">
            <span class="stat-label">Mov:</span><span class="stat-value">${stats.move}</span>
            <span class="stat-label">Fight:</span><span class="stat-value">${stats.fight}</span>
            <span class="stat-label">Shoot:</span><span class="stat-value">${stats.shoot}</span>
            <span class="stat-label">Armor:</span><span class="stat-value">${stats.armor}</span>
            <span class="stat-label">Will:</span><span class="stat-value">${stats.will}</span>
            <span class="stat-label">HP:</span>
            <span class="hp-box">
                <button class="hp-btn" onclick="alteraHP(${idx},-1);return false;">-</button>
                <input class="hp-value" type="number" min="0" max="99" value="${pers.hpAtual}" onchange="setHP(event,${idx})">
                <button class="hp-btn" onclick="alteraHP(${idx},1);return false;">+</button>
            </span>
        </div>
        ${magiasSection}
        ${itensSection}
        `
    });
}

// ... (restante do código permanece igual)