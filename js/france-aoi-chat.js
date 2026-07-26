/* ============================================================
   FRANCE AOI CHAT SYSTEM
   Personality system with educational responses and pre-written scripts
   ============================================================ */

class FranceAoiChat {
    constructor() {
        this.aoiInput = document.getElementById('aoiInput');
        this.aoiSend = document.getElementById('aoiSend');
        this.aoiChatMessages = document.getElementById('aoiChatMessages');
        this.franceAoiTab = document.getElementById('franceAoiTab');
        this.franceAoiInterface = document.getElementById('franceAoiInterface');
        this.aoiClose = document.getElementById('aoiClose');
        this.tabClose = document.getElementById('tabClose');
        
        this.currentPersonality = 'tsundere';
        this.personalities = {
            tsundere: {
                prefix: ['I-It\'s not like I want to help you or anything...', 'Tch... Fine, I\'ll explain this to you.', 'Y-You\'re asking me? Well...'],
                suffix: ['...that\'s all there is to it.', 'Don\'t get the wrong idea about me!', 'Now stop bothering me!']
            },
            kuudere: {
                prefix: ['...I see what you\'re asking.', 'That\'s an interesting question.', 'Allow me to clarify.'],
                suffix: ['...do you understand now?', 'Is that sufficient?', 'I hope that clears things up.']
            },
            deredere: {
                prefix: ['Oh! That\'s such a wonderful question!', 'I\'d be SO happy to explain!', 'You\'re going to love learning about this!'],
                suffix: ['Isn\'t that amazing?', 'I hope you enjoyed learning that!', 'Feel free to ask me anything!']
            },
            dandere: {
                prefix: ['...um, if you don\'t mind...', 'S-sorry, but... I can help...', '*nervous laugh* W-Well...'],
                suffix: ['...d-did that help?', '...I hope so anyway...', '*whispers* There\'s more if you want to know...']
            }
        };

        this.prewrittenScripts = {
            'france-aoi': {
                response: 'My name is France Aoi! The name combines "France" - inspired by Les Bleus, the French National Football Team, symbolizing the beautiful blues that define this website - and "Aoi," which means blue in Japanese. Together, they represent the artistic, scientific, and cultural themes of We Met In August?!',
                personality: 'deredere'
            },
            'who-are-you': {
                response: 'I\'m France Aoi, your interactive AI companion here at We Met In August?! I\'m here to guide you through this digital museum, help you understand complex ideas, and make your journey of discovery more engaging. Think of me as a knowledgeable friend who loves talking about science, art, history, and philosophy!',
                personality: 'kuudere'
            },
            'mission': {
                response: 'We Met In August?! explores how humanity has understood itself, the universe, beauty, and culture through science, history, and artistic expression. It\'s a living digital museum where discovery, creativity, and intellectual curiosity flourish together.',
                personality: 'deredere'
            },
            'astronomy': {
                response: 'Astronomy is humanity\'s oldest science - the study of celestial objects and the universe. From ancient civilizations tracking the heavens to modern telescopes revealing distant galaxies, we\'ve continuously sought to understand our place in the cosmos. Would you like to know about specific concepts like black holes, exoplanets, or the Big Bang?',
                personality: 'kuudere'
            },
            'art-history': {
                response: 'Art history reveals how humans express creativity across centuries and cultures. From Renaissance masters like Da Vinci to contemporary artists, each movement reflects the values, struggles, and dreams of its time. Art and science are deeply connected - perspective in painting is mathematics, color theory is physics!',
                personality: 'deredere'
            },
            'philosophy': {
                response: 'Philosophy examines fundamental questions: What is meaning? How do we know truth? What is beauty? These questions have puzzled thinkers from Socrates to contemporary philosophers. Philosophy connects to everything - science, ethics, aesthetics, and our understanding of existence itself.',
                personality: 'tsundere'
            },
            'history': {
                response: 'History isn\'t just dates and events - it\'s the story of human civilization, our mistakes, victories, and evolution. Understanding history helps us comprehend the world today and make better decisions for tomorrow. Every discovery, revolution, and cultural movement shapes who we are.',
                personality: 'kuudere'
            },
            'music': {
                response: 'Music is the mathematical expression of emotion. Whether it\'s Bach\'s fugues reflecting mathematical precision, or jazz improvisation showing artistic freedom, music bridges science and art. Different eras had distinct musical languages - Renaissance polyphony, Baroque ornamentation, Classical symmetry, Romantic passion.',
                personality: 'deredere'
            },
            'literature': {
                response: 'Literature captures human experience through words. From ancient epics like Gilgamesh to modern novels, literature explores identity, morality, love, and meaning. Different literary movements - Romanticism, Modernism, Magical Realism - reflect how each era understood the world.',
                personality: 'dandere'
            },
            'geography': {
                response: 'Geography connects physical landscapes with human cultures. It explores how mountains shape civilizations, how oceans facilitate trade, how climate influences development. Geography is where Earth science meets human story.',
                personality: 'kuudere'
            }
        };

        this.initializeChat();
        this.setupDragTab();
    }

    initializeChat() {
        this.franceAoiTab.addEventListener('click', () => this.openInterface());
        this.aoiClose.addEventListener('click', () => this.closeInterface());
        this.tabClose.addEventListener('click', () => this.closeInterface());
        this.aoiSend.addEventListener('click', () => this.sendMessage());
        this.aoiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Add welcome message
        this.addMessage('France Aoi', 'Bonjour! Welcome to We Met In August?! I\'m France Aoi, your guide through this digital museum. Feel free to ask me about anything - science, art, history, philosophy, or even about me! What interests you today?', 'assistant');
    }

    setupDragTab() {
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        this.franceAoiTab.addEventListener('dragstart', (e) => {
            isDragging = true;
            const rect = this.franceAoiTab.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
        });

        document.addEventListener('dragover', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        });

        document.addEventListener('drop', (e) => {
            if (isDragging) {
                e.preventDefault();
                this.franceAoiTab.style.left = (e.clientX - offset.x) + 'px';
                this.franceAoiTab.style.top = (e.clientY - offset.y) + 'px';
                isDragging = false;
            }
        });
    }

    openInterface() {
        this.franceAoiInterface.classList.remove('hidden');
        this.aoiInput.focus();
    }

    closeInterface() {
        this.franceAoiInterface.classList.add('hidden');
    }

    sendMessage() {
        const message = this.aoiInput.value.trim();
        if (!message) return;

        this.addMessage('You', message, 'user');
        this.aoiInput.value = '';

        // Simulate thinking delay
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage('France Aoi', response, 'assistant');
        }, 500);
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Check for pre-written scripts
        for (const [keyword, data] of Object.entries(this.prewrittenScripts)) {
            if (lowerMessage.includes(keyword)) {
                this.currentPersonality = data.personality;
                return this.applyPersonality(data.response);
            }
        }

        // General responses based on keywords
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('greetings')) {
            this.currentPersonality = 'deredere';
            return this.applyPersonality('Bonjour! I\'m so glad you\'re here! Welcome to We Met In August?! Is there anything specific you\'d like to explore today?');
        }

        if (lowerMessage.includes('astronomy') || lowerMessage.includes('space') || lowerMessage.includes('stars') || lowerMessage.includes('universe')) {
            this.currentPersonality = 'kuudere';
            return this.applyPersonality('The universe is vast and magnificent. We\'ve barely scratched the surface of understanding it. Would you like to explore topics like stellar formation, galaxies, or the cosmic microwave background?');
        }

        if (lowerMessage.includes('help') || lowerMessage.includes('guide') || lowerMessage.includes('how')) {
            this.currentPersonality = 'deredere';
            return this.applyPersonality('I\'d be delighted to help! You can explore our various sections - Astronomy, History, Geography, Art, Philosophy, and more. Each contains fascinating articles, videos, and interviews. Just navigate using the menu or ask me specific questions!');
        }

        if (lowerMessage.includes('art') || lowerMessage.includes('painting') || lowerMessage.includes('sculpture')) {
            this.currentPersonality = 'deredere';
            return this.applyPersonality('Art is humanity\'s most beautiful expression! From Renaissance masterpieces to contemporary installations, art reflects how we see ourselves and the world. Would you like to explore painting, film, photography, or architecture?');
        }

        if (lowerMessage.includes('history') || lowerMessage.includes('past') || lowerMessage.includes('civilization')) {
            this.currentPersonality = 'kuudere';
            return this.applyPersonality('History teaches us who we are through our past. Every era has lessons - triumphs and failures alike. What historical period or event interests you? Ancient civilizations? Medieval times? Modern revolutions?');
        }

        if (lowerMessage.includes('philosophy') || lowerMessage.includes('meaning') || lowerMessage.includes('existence')) {
            this.currentPersonality = 'tsundere';
            return this.applyPersonality('Philosophy examines life\'s deepest questions... N-Not that you need me to explain that! But if you\'re curious about ethics, epistemology, or metaphysics, I can guide you through the great thinkers.');
        }

        if (lowerMessage.includes('music') || lowerMessage.includes('song') || lowerMessage.includes('composer')) {
            this.currentPersonality = 'deredere';
            return this.applyPersonality('Music is the language of the soul! Whether classical symphonies or contemporary compositions, music expresses what words cannot. The website has a beautiful seasonal soundtrack - are you enjoying it?');
        }

        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')) {
            this.currentPersonality = 'dandere';
            return this.applyPersonality('...y-you\'re welcome! I\'m just... happy to help. Thank you for visiting We Met In August?! I hope you continue to discover amazing things here...');
        }

        if (lowerMessage.includes('love') || lowerMessage.includes('beautiful') || lowerMessage.includes('amazing')) {
            this.currentPersonality = 'deredere';
            return this.applyPersonality('I\'m so happy you feel that way! This website is designed to be a place of beauty and wonder. Every section reveals the incredible achievements of human creativity and understanding. Keep exploring!');
        }

        // Default educational response
        this.currentPersonality = 'kuudere';
        return this.applyPersonality('That\'s an intriguing question. We Met In August?! contains vast information about science, art, history, and philosophy. Would you like me to direct you to a specific section, or would you prefer to explore one of our featured topics?');
    }

    applyPersonality(response) {
        const personality = this.personalities[this.currentPersonality];
        const prefix = personality.prefix[Math.floor(Math.random() * personality.prefix.length)];
        const suffix = personality.suffix[Math.floor(Math.random() * personality.suffix.length)];
        
        return `${prefix} ${response} ${suffix}`;
    }

    addMessage(sender, text, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `aoi-message ${type}`;
        messageEl.textContent = text;
        this.aoiChatMessages.appendChild(messageEl);
        this.aoiChatMessages.scrollTop = this.aoiChatMessages.scrollHeight;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FranceAoiChat();
});