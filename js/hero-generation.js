/* ============================================================
   HERO GENERATION SYSTEM
   Dynamically renders 60+ blue stripes and scattered symbols
   ============================================================ */

class HeroGenerator {
    constructor() {
        this.stripesContainer = document.getElementById('heroStripesContainer');
        this.symbolsLayer = document.getElementById('heroSymbolsLayer');
        this.generateStripes();
        this.generateSymbols();
    }

    generateStripes() {
        // 60 vibrant blues from light to dark
        const blues = [
            '#F0F8FF', '#E6F2FF', '#D4E8FF', '#C2DEFF', '#B0D4FF',
            '#9ECAFF', '#8CC0FF', '#7AB6FF', '#68ACFF', '#56A2FF',
            '#4498FF', '#328EFF', '#2084FF', '#0E7AFF', '#0070FF',
            '#0066FF', '#005CE6', '#0052CC', '#0048B3', '#003E9A',
            '#003480', '#002A67', '#00204E', '#001635', '#1E90FF',
            '#1873E8', '#1256D1', '#0C39BA', '#0628A3', '#051B8C',
            '#001F54', '#00BFFF', '#00AAFF', '#0095FF', '#0080FF',
            '#006BFF', '#0056FF', '#0041FF', '#6495ED', '#5A8FE5',
            '#4E89DD', '#4283D5', '#367DCD', '#2A77C5', '#1E71BD',
            '#126BB5', '#0665AD', '#005FA5', '#1E3A8A', '#1E40AF',
            '#1F2937', '#0F172A', '#020617', '#7C3AED', '#6D28D9',
            '#5B21B6', '#4C1D95', '#3F0F5C', '#2D0052', '#001F54',
            '#191970', '#0047AB', '#4169E1', '#00008B', '#000080'
        ];

        blues.forEach((color, index) => {
            const stripe = document.createElement('div');
            stripe.className = 'hero-stripe';
            stripe.style.background = `linear-gradient(180deg, ${color} 0%, ${this.darkenColor(color, 10)} 100%)`;
            stripe.style.borderRight = '2px solid rgba(0, 0, 0, 0.12)';
            this.stripesContainer.appendChild(stripe);
        });
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    generateSymbols() {
        const positions = [
            { x: '5%', y: '10%' }, { x: '15%', y: '20%' }, { x: '8%', y: '50%' },
            { x: '12%', y: '70%' }, { x: '20%', y: '15%' }, { x: '25%', y: '40%' },
            { x: '18%', y: '80%' }, { x: '30%', y: '25%' }, { x: '35%', y: '55%' },
            { x: '28%', y: '75%' }, { x: '40%', y: '10%' }, { x: '45%', y: '45%' },
            { x: '38%', y: '65%' }, { x: '50%', y: '20%' }, { x: '55%', y: '50%' },
            { x: '48%', y: '85%' }, { x: '60%', y: '15%' }, { x: '65%', y: '60%' },
            { x: '58%', y: '40%' }, { x: '70%', y: '25%' }, { x: '75%', y: '55%' },
            { x: '68%', y: '75%' }, { x: '80%', y: '10%' }, { x: '85%', y: '50%' },
            { x: '78%', y: '70%' }, { x: '90%', y: '20%' }, { x: '95%', y: '45%' },
            { x: '88%', y: '80%' }, { x: '22%', y: '60%' }, { x: '42%', y: '80%' },
            { x: '62%', y: '35%' }, { x: '82%', y: '65%' }, { x: '10%', y: '35%' }
        ];

        positions.forEach((pos) => {
            const symbol = document.createElement('div');
            symbol.className = 'hero-symbol';
            symbol.textContent = Math.random() > 0.5 ? '?' : '!';
            symbol.style.left = pos.x;
            symbol.style.top = pos.y;
            symbol.style.fontSize = Math.random() > 0.5 ? '1.5rem' : '2rem';
            symbol.style.animationDelay = Math.random() * 3 + 's';
            this.symbolsLayer.appendChild(symbol);
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new HeroGenerator();
});