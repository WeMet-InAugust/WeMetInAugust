/* ============================================================
   FRANCE AOI CHARACTER RENDERING SYSTEM
   Canvas-based pixel art with seasonal animations
   ============================================================ */

class FranceAoiCharacter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.season = this.getCurrentSeason();
        this.hour = new Date().getHours();
        this.outfit = this.getSeasonalOutfit();
        this.poodlePosition = { x: 80, y: 150 };
        this.characterPosition = { x: 110, y: 120 };
        this.animationFrame = 0;
        this.isLeaving = false;
        this.startAnimation();
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 10 || month < 2) return 'winter';
        if (month >= 2 && month < 5) return 'spring';
        if (month >= 5 && month < 8) return 'summer';
        if (month >= 8 && month < 10) return 'autumn';
    }

    getSeasonalOutfit() {
        const outfits = {
            winter: {
                jerseystyle: 'france-national', // French National Team
                color: '#001F54',
                accent: '#FFFFFF',
                bottoms: 'leggings',
                socks: 'long-white',
                shoes: 'adidas-gazelle-white'
            },
            spring: {
                jerseystyle: 'psg-home',
                color: '#002A7F',
                accent: '#FFD700',
                bottoms: 'skirt',
                socks: 'long-pastel-pink',
                shoes: 'adidas-samba-white'
            },
            summer: {
                jerseystyle: 'psg-away',
                color: '#FFFFFF',
                accent: '#002A7F',
                bottoms: 'shorts',
                socks: 'short-white',
                shoes: 'adidas-gazelle-gold'
            },
            autumn: {
                jerseystyle: 'france-national',
                color: '#0047AB',
                accent: '#FFD700',
                bottoms: 'pants',
                socks: 'long-burgundy',
                shoes: 'adidas-samba-dark'
            }
        };
        return outfits[this.season] || outfits.summer;
    }

    drawPixelRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    drawHead() {
        const x = this.characterPosition.x;
        const y = this.characterPosition.y;

        // Skin tone base
        this.drawPixelRect(x - 8, y - 12, 16, 14, '#F5C5A0');

        // Blue hair (French flag blue - bright)
        const hairBlue = '#0057D9';
        for (let i = 0; i < 3; i++) {
            this.drawPixelRect(x - 10 + i * 2, y - 14, 2, 2, hairBlue);
        }
        for (let i = 0; i < 4; i++) {
            this.drawPixelRect(x - 12 + i * 2, y - 12, 2, 2, hairBlue);
        }
        for (let i = 0; i < 4; i++) {
            this.drawPixelRect(x - 12 + i * 2, y - 10, 2, 3, hairBlue);
        }

        // Eyes (same blue as hair)
        this.drawPixelRect(x - 4, y - 6, 2, 2, hairBlue);
        this.drawPixelRect(x + 2, y - 6, 2, 2, hairBlue);

        // Mouth
        this.drawPixelRect(x - 2, y + 2, 4, 1, '#D9486B');
    }

    drawJersey() {
        const x = this.characterPosition.x;
        const y = this.characterPosition.y + 2;
        const jerseyColor = this.outfit.color;
        const accentColor = this.outfit.accent;

        // Jersey body
        this.drawPixelRect(x - 10, y, 20, 12, jerseyColor);

        // Jersey trim
        this.drawPixelRect(x - 10, y, 20, 1, accentColor);

        // PSG/France emblem (simple pixel design)
        this.drawPixelRect(x - 2, y + 2, 4, 4, accentColor);
    }

    drawBottoms() {
        const x = this.characterPosition.x;
        const y = this.characterPosition.y + 14;
        const color = this.outfit.bottoms === 'skirt' ? '#FFB6D9' : 
                     this.outfit.bottoms === 'shorts' ? '#FFD700' : '#2A2A2A';

        if (this.outfit.bottoms === 'skirt') {
            this.drawPixelRect(x - 9, y, 18, 8, color);
            this.drawPixelRect(x - 10, y + 2, 1, 6, color);
            this.drawPixelRect(x + 9, y + 2, 1, 6, color);
        } else {
            this.drawPixelRect(x - 9, y, 18, 6, color);
        }
    }

    drawLegs() {
        const x = this.characterPosition.x;
        const y = this.characterPosition.y + 20;
        const sockColor = this.outfit.socks === 'long-white' ? '#FFFFFF' :
                        this.outfit.socks === 'long-pastel-pink' ? '#FFD9E8' :
                        this.outfit.socks === 'long-burgundy' ? '#8B0020' : '#E8E8E8';

        // Long socks
        for (let leg = 0; leg < 2; leg++) {
            const legX = x + (leg === 0 ? -4 : 4);
            this.drawPixelRect(legX - 2, y, 4, 12, sockColor);
            this.drawPixelRect(legX - 2, y + 12, 4, 2, '#F5C5A0'); // Shoes peek
        }
    }

    drawShoes() {
        const x = this.characterPosition.x;
        const y = this.characterPosition.y + 32;
        const shoeColor = this.outfit.shoes.includes('gold') ? '#FFD700' : '#FFFFFF';

        // Adidas-style shoes with three stripes
        for (let leg = 0; leg < 2; leg++) {
            const legX = x + (leg === 0 ? -4 : 4);
            this.drawPixelRect(legX - 3, y, 6, 3, shoeColor);
            // Three stripes
            this.drawPixelRect(legX - 2, y + 1, 1, 1, '#000000');
            this.drawPixelRect(legX, y + 1, 1, 1, '#000000');
            this.drawPixelRect(legX + 2, y + 1, 1, 1, '#000000');
        }
    }

    drawPoodle() {
        const px = this.poodlePosition.x;
        const py = this.poodlePosition.y;

        // Ginger/reddish poodle body
        const poodleColor = '#D2691E';

        // Head
        this.drawPixelRect(px - 4, py - 8, 8, 8, poodleColor);

        // Ears (fluffy)
        for (let i = 0; i < 4; i++) {
            this.drawPixelRect(px - 6, py - 8 + i, 2, 2, poodleColor);
            this.drawPixelRect(px + 4, py - 8 + i, 2, 2, poodleColor);
        }

        // Eyes (small black dots)
        this.drawPixelRect(px - 2, py - 5, 1, 1, '#000000');
        this.drawPixelRect(px + 1, py - 5, 1, 1, '#000000');

        // Body
        this.drawPixelRect(px - 5, py, 10, 8, poodleColor);

        // Legs (stubby)
        for (let i = 0; i < 4; i++) {
            const legX = px - 4 + i * 3;
            this.drawPixelRect(legX, py + 8, 2, 4, poodleColor);
        }

        // Tail (curly poodle tail)
        this.drawPixelRect(px + 4, py + 2, 3, 2, poodleColor);
    }

    drawEnvironment() {
        // Apple tree
        const treeX = 30;
        const treeY = 100;

        // Trunk
        this.drawPixelRect(treeX - 3, treeY, 6, 25, '#8B4513');

        // Canopy changes by season
        if (this.season === 'winter') {
            // Snow-covered branches
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(treeX, treeY - 30, 25, 0, Math.PI * 2);
            this.ctx.fill();
            // Snow chunks
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const sx = treeX + Math.cos(angle) * 20;
                const sy = treeY - 30 + Math.sin(angle) * 20;
                this.drawPixelRect(sx - 2, sy - 2, 4, 4, '#F0F8FF');
            }
        } else if (this.season === 'spring') {
            // Blooming (pink blossoms)
            this.ctx.fillStyle = '#FFB6D9';
            this.ctx.beginPath();
            this.ctx.arc(treeX, treeY - 30, 25, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (this.season === 'summer') {
            // Full green canopy
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(treeX, treeY - 30, 25, 0, Math.PI * 2);
            this.ctx.fill();
            // Apples
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const ax = treeX + Math.cos(angle) * 15;
                const ay = treeY - 30 + Math.sin(angle) * 15;
                this.drawPixelRect(ax - 2, ay - 2, 4, 4, '#DC143C');
            }
        } else if (this.season === 'autumn') {
            // Golden/reddish leaves
            this.ctx.fillStyle = '#FF8C00';
            this.ctx.beginPath();
            this.ctx.arc(treeX, treeY - 30, 25, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawParis() {
        // Simple silhouette of Parisian buildings/Eiffel Tower hint
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        
        // Building silhouettes
        this.drawPixelRect(200, 50, 15, 80, 'rgba(0, 0, 0, 0.1)');
        this.drawPixelRect(220, 60, 12, 70, 'rgba(0, 0, 0, 0.1)');
        this.drawPixelRect(235, 55, 10, 75, 'rgba(0, 0, 0, 0.1)');
    }

    drawGrass() {
        const grassColor = this.season === 'winter' ? '#E8E8E8' : '#90EE90';
        this.drawPixelRect(0, this.canvas.height - 10, this.canvas.width, 10, grassColor);
    }

    update() {
        this.animationFrame++;

        // Character breathing animation
        this.characterPosition.y = 120 + Math.sin(this.animationFrame * 0.02) * 2;

        // Poodle wagging tail (movement)
        this.poodlePosition.x = 80 + Math.sin(this.animationFrame * 0.015) * 3;

        // Leaving animation at 7 PM
        if (this.hour === 19 && this.animationFrame > 300) {
            this.isLeaving = true;
            this.characterPosition.x += 1;
            this.poodlePosition.x += 1;
        }

        // Returning animation at 7 AM
        if (this.hour === 7 && this.animationFrame > 300) {
            this.isLeaving = false;
            if (this.characterPosition.x > 110) {
                this.characterPosition.x -= 0.5;
                this.poodlePosition.x -= 0.5;
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.season === 'winter' ? 'rgba(220, 240, 255, 0.3)' : 'rgba(240, 250, 255, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw elements
        this.drawGrass();
        this.drawParis();
        this.drawEnvironment();
        
        if (!this.isLeaving || this.characterPosition.x < 150) {
            this.drawPoodle();
            this.drawHead();
            this.drawJersey();
            this.drawBottoms();
            this.drawLegs();
            this.drawShoes();
        }
    }

    startAnimation() {
        const animate = () => {
            this.update();
            this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

// Initialize on tab canvas
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('franceAoiTabCanvas')) {
        new FranceAoiCharacter('franceAoiTabCanvas');
    }
    if (document.getElementById('seasonalIdleCanvas')) {
        new FranceAoiCharacter('seasonalIdleCanvas');
    }
    if (document.getElementById('franceAoiHeaderCanvas')) {
        new FranceAoiCharacter('franceAoiHeaderCanvas');
    }
});