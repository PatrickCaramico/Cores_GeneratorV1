document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // SELETORES
    // =============================================
    const paletaContainer       = document.getElementById('paleta-container');
    const gerarBtn              = document.getElementById('gerar-btn');
    const tipoPaletaSelect      = document.getElementById('tipo-paleta');
    const hexWrap               = document.getElementById('hex-wrap');
    const hexInput              = document.getElementById('hex-input');
    const sectionTitlePaleta    = document.getElementById('section-title-paleta');
    const daltonismoSelect      = document.getElementById('daltonismo-select');
    const modal                 = document.getElementById('color-modal');
    const modalClose            = document.getElementById('modal-close');
    const modalSelectedColor    = document.getElementById('modal-selected-color');
    const modalSelectedHex      = document.getElementById('modal-selected-hex');
    const modalContrastBadge    = document.getElementById('modal-contrast-badge');
    const modalExportGrid       = document.getElementById('modal-export-grid');
    const modalDegradeContainer = document.getElementById('modal-degrade-container');
    const historicoContainer    = document.getElementById('historico-container');
    const previewNav            = document.getElementById('preview-nav');
    const previewTitle          = document.getElementById('preview-title');
    const previewBtn            = document.getElementById('preview-btn');
    const previewTargetBtns     = document.querySelectorAll('.preview-target-btn');

    // =============================================
    // ESTADO
    // =============================================
    let paletaAtual   = [];    // array de { hex, locked }
    let historicoArr  = JSON.parse(localStorage.getItem('clickcolor_historico') || '[]');
    let previewTarget = 'nav'; // qual elemento do preview recebe a cor

    // =============================================
    // UTILITARIOS DE COR
    // =============================================
    const gerarCorHex = () => {
        const letras = '0123456789ABCDEF';
        let cor = '#';
        for (let i = 0; i < 6; i++) cor += letras[Math.floor(Math.random() * 16)];
        return cor;
    };

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function hslToHex(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s /= 100; l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0').toUpperCase();
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function hexToRgbString(hex) {
        const { r, g, b } = hexToRgb(hex);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToHslString(hex) {
        const { r, g, b } = hexToRgb(hex);
        const { h, s, l } = rgbToHsl(r, g, b);
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    // Luminancia relativa WCAG
    function luminance(hex) {
        const { r, g, b } = hexToRgb(hex);
        const channel = c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    }

    function contrastRatio(hex1, hex2) {
        const lum1 = luminance(hex1), lum2 = luminance(hex2);
        const lighter = Math.max(lum1, lum2), darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    // Retorna qual texto (branco ou preto) tem melhor contraste com a cor de fundo
    function melhorTexto(hex) {
        return contrastRatio(hex, '#FFFFFF') > contrastRatio(hex, '#000000') ? '#FFFFFF' : '#000000';
    }

    // Passa no WCAG AA (texto normal >= 4.5)
    function passaWCAG(hex) {
        const corTexto = melhorTexto(hex);
        return contrastRatio(hex, corTexto) >= 4.5;
    }

    // =============================================
    // GERACAO DE PALETA
    // =============================================
    function gerarPaletaHSL(baseHex, quantidade = 5) {
        const { r, g, b } = hexToRgb(baseHex);
        const { h, s, l } = rgbToHsl(r, g, b);
        const offsets = [0, 30, 60, -30, -60];
        return offsets.slice(0, quantidade).map(offset => hslToHex(h + offset, s, l));
    }

    function gerarDegrade(hex, quantidade = 5) {
        const { r, g, b } = hexToRgb(hex);
        const cores = [];
        for (let i = 0; i < quantidade; i++) {
            const fator = 0.2 + i * 0.15;
            const nr = Math.round(r * fator + 255 * (1 - fator));
            const ng = Math.round(g * fator + 255 * (1 - fator));
            const nb = Math.round(b * fator + 255 * (1 - fator));
            cores.push(`#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`.toUpperCase());
        }
        return cores;
    }

    // =============================================
    // CARD DE COR
    // =============================================
    function criarCardCor(entry) {
        const { hex, locked } = entry;
        const corCard = document.createElement('div');
        corCard.classList.add('color-card');
        if (locked) corCard.classList.add('color-card--locked');

        // Quadrado de cor
        const corQuadrado = document.createElement('div');
        corQuadrado.classList.add('color-card__square');
        corQuadrado.style.backgroundColor = hex;

        // Ícone de cadeado
        const lockIcon = document.createElement('span');
        lockIcon.classList.add('color-card__lock');
        lockIcon.textContent = locked ? '🔒' : '🔓';
        lockIcon.title = locked ? 'Destravar cor' : 'Travar cor';
        lockIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            entry.locked = !entry.locked;
            corCard.classList.toggle('color-card--locked', entry.locked);
            lockIcon.textContent = entry.locked ? '🔒' : '🔓';
            lockIcon.title = entry.locked ? 'Destravar cor' : 'Travar cor';
        });

        // Badge de contraste WCAG
        const contrastBadge = document.createElement('span');
        contrastBadge.classList.add('color-card__contrast');
        const passa = passaWCAG(hex);
        const textoCor = melhorTexto(hex);
        contrastBadge.textContent = passa ? '✔ AA' : '✘ AA';
        contrastBadge.classList.add(textoCor === '#FFFFFF' ? 'color-card__contrast--dark' : 'color-card__contrast--light');
        contrastBadge.title = passa ? 'Passa no contraste WCAG AA' : 'Não passa no contraste WCAG AA';

        corQuadrado.appendChild(lockIcon);
        corQuadrado.appendChild(contrastBadge);

        // HEX + ícone de copiar
        const corHex = document.createElement('div');
        corHex.classList.add('color-card__hex');
        corHex.style.color = melhorTexto(hex) === '#FFFFFF' ? '#333' : '#333';

        const hexText = document.createElement('span');
        hexText.textContent = hex;

        const copyIcon = document.createElement('span');
        copyIcon.classList.add('color-card__copy-icon');
        copyIcon.textContent = '📋';

        corHex.appendChild(hexText);
        corHex.appendChild(copyIcon);

        // Copiar ao clicar no hex
        corHex.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(hex).then(() => {
                copyIcon.textContent = '✔';
                copyIcon.classList.add('copied');
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Copiado: ${hex}`,
                    showConfirmButton: false,
                    timer: 1400,
                    timerProgressBar: true
                });
                setTimeout(() => {
                    copyIcon.textContent = '📋';
                    copyIcon.classList.remove('copied');
                }, 1500);
            });
        });

        // Abrir modal ao clicar no quadrado
        corQuadrado.addEventListener('click', () => abrirModalCor(hex));

        // Aplicar cor no preview ao clicar no card (quadrado)
        corQuadrado.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            aplicarCorNoPreview(hex);
        });

        corCard.appendChild(corQuadrado);
        corCard.appendChild(corHex);
        return corCard;
    }

    // =============================================
    // RENDERIZAR PALETA
    // =============================================
    function renderizarPaleta(cores) {
        paletaContainer.innerHTML = '';
        paletaAtual = cores.map(hex => ({ hex, locked: false }));
        paletaAtual.forEach(entry => {
            paletaContainer.appendChild(criarCardCor(entry));
        });
    }

    // =============================================
    // GERAR PALETA
    // =============================================
    function gerarPaleta() {
        const tipo = tipoPaletaSelect.value;

        if (tipo === 'hex') {
            let hex = hexInput.value.trim();
            if (!hex.startsWith('#')) hex = '#' + hex;
            if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'HEX inválido',
                    text: 'Use o formato #RRGGBB, ex: #19A9E4',
                    confirmButtonColor: '#007bff'
                });
                return;
            }
            hexInput.value = hex.toUpperCase();
            const cores = gerarPaletaHSL(hex, 5);
            renderizarPaleta(cores);
            sectionTitlePaleta.textContent = `Paleta Analógica de ${hex.toUpperCase()}`;
        } else {
            // Mantém cores travadas, gera novas para as destravadas
            const novasCores = [];
            for (let i = 0; i < 5; i++) {
                if (paletaAtual[i] && paletaAtual[i].locked) {
                    novasCores.push(paletaAtual[i].hex);
                } else {
                    novasCores.push(gerarCorHex());
                }
            }
            renderizarPaleta(novasCores);
            // Restaurar estado de lock (as novas nao estao travadas, mas as antigas sim)
            paletaAtual.forEach((entry, i) => {
                if (paletaAtual[i] && paletaAtual[i - 0]) {
                    // locked ja foi resetado em renderizarPaleta, so as antigas travadas precisam ser restauradas
                }
            });
            sectionTitlePaleta.textContent = 'Paleta Aleatória';
        }

        // Salvar no histórico
        salvarHistorico(paletaAtual.map(e => e.hex));
    }

    // Versao que preserva locks para geracao randomica
    function gerarPaletaPreservandoLocks() {
        if (tipoPaletaSelect.value === 'hex') { gerarPaleta(); return; }

        const novosHexes = paletaAtual.map(entry =>
            entry.locked ? entry.hex : gerarCorHex()
        );

        // Preservar estado de lock
        const lockedStates = paletaAtual.map(e => e.locked);
        paletaContainer.innerHTML = '';
        paletaAtual = novosHexes.map((hex, i) => ({ hex, locked: lockedStates[i] || false }));
        paletaAtual.forEach(entry => paletaContainer.appendChild(criarCardCor(entry)));

        sectionTitlePaleta.textContent = 'Paleta Aleatória';
        salvarHistorico(paletaAtual.map(e => e.hex));
    }

    // =============================================
    // HISTORICO
    // =============================================
    function salvarHistorico(cores) {
        historicoArr.unshift([...cores]);
        if (historicoArr.length > 10) historicoArr.pop();
        localStorage.setItem('clickcolor_historico', JSON.stringify(historicoArr));
        renderizarHistorico();
    }

    function renderizarHistorico() {
        historicoContainer.innerHTML = '';
        if (historicoArr.length === 0) {
            historicoContainer.innerHTML = '<p class="historico-vazio">Nenhuma paleta gerada ainda.</p>';
            return;
        }
        historicoArr.forEach((cores, idx) => {
            const item = document.createElement('div');
            item.classList.add('historico-item');
            item.title = `Restaurar paleta ${idx + 1}`;
            cores.forEach(hex => {
                const sq = document.createElement('div');
                sq.classList.add('historico-item__cor');
                sq.style.backgroundColor = hex;
                item.appendChild(sq);
            });
            item.addEventListener('click', () => restaurarPaleta(cores));
            historicoContainer.appendChild(item);
        });
    }

    function restaurarPaleta(cores) {
        renderizarPaleta(cores);
        sectionTitlePaleta.textContent = 'Paleta Restaurada';
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Paleta restaurada!',
            showConfirmButton: false,
            timer: 1200
        });
    }

    // =============================================
    // PREVIEW
    // =============================================
    function aplicarCorNoPreview(hex) {
        switch (previewTarget) {
            case 'nav':
                previewNav.style.background = hex;
                previewNav.style.color = melhorTexto(hex);
                break;
            case 'title':
                previewTitle.style.color = hex;
                break;
            case 'btn':
                previewBtn.style.background = hex;
                previewBtn.style.color = melhorTexto(hex);
                break;
        }
        Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: `Cor aplicada no preview!`,
            showConfirmButton: false,
            timer: 1100
        });
    }

    previewTargetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            previewTargetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            previewTarget = btn.dataset.target;
        });
    });

    // Clique unico no quadrado do card aplica no preview
    paletaContainer.addEventListener('click', (e) => {
        const square = e.target.closest('.color-card__square');
        if (square) {
            const card = square.closest('.color-card');
            if (card) {
                const hex = card.querySelector('.color-card__hex span').textContent;
                aplicarCorNoPreview(hex);
            }
        }
    });

    // =============================================
    // MODAL
    // =============================================
    function abrirModalCor(hex) {
        modalSelectedColor.style.backgroundColor = hex;
        modalSelectedHex.textContent = hex;

        // Contraste WCAG
        const corTexto = melhorTexto(hex);
        const ratio = contrastRatio(hex, corTexto).toFixed(2);
        const passa = parseFloat(ratio) >= 4.5;
        modalContrastBadge.textContent = passa
            ? `✔ WCAG AA — Contraste ${ratio}:1`
            : `✘ WCAG AA — Contraste ${ratio}:1`;
        modalContrastBadge.className = 'modal__contrast-badge ' +
            (passa ? 'modal__contrast-badge--pass' : 'modal__contrast-badge--fail');

        // Exportacao
        const { r, g, b } = hexToRgb(hex);
        const { h, s, l } = rgbToHsl(r, g, b);
        const formatos = [
            { label: 'HEX',          valor: hex },
            { label: 'RGB',          valor: `rgb(${r}, ${g}, ${b})` },
            { label: 'HSL',          valor: `hsl(${h}, ${s}%, ${l}%)` },
            { label: 'CSS Variable', valor: `--color-primary: ${hex};` }
        ];
        modalExportGrid.innerHTML = '';
        formatos.forEach(({ label, valor }) => {
            const item = document.createElement('div');
            item.classList.add('export-item');
            item.innerHTML = `
                <span class="export-item__label">${label}</span>
                <span class="export-item__value">${valor}</span>
                <span class="export-item__copy">📋 Copiar</span>
            `;
            item.addEventListener('click', () => {
                navigator.clipboard.writeText(valor).then(() => {
                    item.querySelector('.export-item__copy').textContent = '✔ Copiado!';
                    setTimeout(() => { item.querySelector('.export-item__copy').textContent = '📋 Copiar'; }, 1500);
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Copiado: ${valor}`, showConfirmButton: false, timer: 1200 });
                });
            });
            modalExportGrid.appendChild(item);
        });

        // Degrade
        const degradeCores = gerarDegrade(hex, 5);
        modalDegradeContainer.innerHTML = '';
        degradeCores.forEach(corDegrade => {
            const degradeCard = document.createElement('div');
            degradeCard.classList.add('degrade-card');

            const degradeColor = document.createElement('div');
            degradeColor.classList.add('degrade-card__color');
            degradeColor.style.backgroundColor = corDegrade;

            const degradeHex = document.createElement('div');
            degradeHex.classList.add('degrade-card__hex');

            const degradeText = document.createElement('span');
            degradeText.textContent = corDegrade;

            const copyIcon = document.createElement('span');
            copyIcon.classList.add('degrade-card__copy');
            copyIcon.textContent = '📋';

            function copiarCor() {
                navigator.clipboard.writeText(corDegrade).then(() => {
                    copyIcon.classList.add('copied');
                    copyIcon.textContent = '✔';
                    setTimeout(() => { copyIcon.classList.remove('copied'); copyIcon.textContent = '📋'; }, 1200);
                });
            }
            degradeHex.addEventListener('click', copiarCor);
            copyIcon.addEventListener('click', copiarCor);

            degradeHex.appendChild(degradeText);
            degradeHex.appendChild(copyIcon);
            degradeCard.appendChild(degradeColor);
            degradeCard.appendChild(degradeHex);
            modalDegradeContainer.appendChild(degradeCard);
        });

        modal.classList.add('active');
    }

    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    // =============================================
    // FILTRO DE DALTONISMO
    // =============================================
    const daltonismoFiltros = {
        none:          'none',
        protanopia:    'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'p\'><feColorMatrix type=\'matrix\' values=\'0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0\'/></filter></svg>#p")',
        deuteranopia:  'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'d\'><feColorMatrix type=\'matrix\' values=\'0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0\'/></filter></svg>#d")',
        tritanopia:    'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'t\'><feColorMatrix type=\'matrix\' values=\'0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0\'/></filter></svg>#t")',
        achromatopsia: 'grayscale(100%)'
    };

    daltonismoSelect.addEventListener('change', () => {
        const filtro = daltonismoFiltros[daltonismoSelect.value] || 'none';
        paletaContainer.style.filter = filtro;
    });

    // =============================================
    // MOSTRAR / ESCONDER INPUT HEX
    // =============================================
    tipoPaletaSelect.addEventListener('change', () => {
        hexWrap.style.display = tipoPaletaSelect.value === 'hex' ? 'flex' : 'none';
        gerarBtn.querySelector('span').textContent = tipoPaletaSelect.value === 'hex' ? '🎨' : '🎲';
    });

    // Formatar input HEX automaticamente
    hexInput.addEventListener('input', () => {
        let val = hexInput.value.replace(/[^0-9A-Fa-f#]/g, '');
        if (val && !val.startsWith('#')) val = '#' + val;
        hexInput.value = val.substring(0, 7).toUpperCase();
    });

    // =============================================
    // EVENTOS
    // =============================================
    gerarBtn.addEventListener('click', () => gerarPaletaPreservandoLocks());

    // Barra de espaco gera nova paleta
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            gerarPaletaPreservandoLocks();
        }
    });

    // =============================================
    // INICIALIZACAO
    // =============================================
    renderizarHistorico();

    // Gerar paleta inicial com 5 cores aleatorias
    const coresIniciais = Array.from({ length: 5 }, gerarCorHex);
    renderizarPaleta(coresIniciais);
    salvarHistorico(coresIniciais);
});
