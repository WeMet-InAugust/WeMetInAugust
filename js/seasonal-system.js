/* ============================================================
   SEASONAL MUSIC & ATMOSPHERE SYSTEM
   Complete playlist management with multi-source fallback
   ============================================================ */

class SeasonalMusicSystem {
    constructor() {
        this.currentSeason = this.detectSeason();
        this.playlist = this.buildPlaylist();
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.playerInfo = document.getElementById('playerInfo');
        this.initializePlayer();
        this.playRandomIntroSong();
    }

    detectSeason() {
        const month = new Date().getMonth();
        const day = new Date().getDate();

        // Thanksgiving is 4th Thursday of November
        const novemberDate = new Date(new Date().getFullYear(), 10, 1);
        const thanksgiving = new Date(novemberDate.setDate(novemberDate.getDate() - novemberDate.getDay() + 4 + 7 * 3));
        const thanksgivingDay = thanksgiving.getDate();

        if (month === 10 && day < thanksgivingDay) return 'autumn';
        if ((month === 10 && day >= thanksgivingDay) || (month === 11)) return 'christmas-season';
        if (month === 0 && day <= 31) return 'winter-frost';
        if (month === 1 && day <= 28) return 'winter-romance';
        if (month >= 2 && month < 5) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month === 7 && day > 15) return 'summer-late';
        return 'autumn';
    }

    buildPlaylist() {
        const playlists = {
            'christmas-season': [
                { title: 'White Christmas', artist: 'Bing Crosby', type: 'streaming', sources: ['spotify', 'youtube', 'soundcloud'] },
                { title: 'Jingle Bell Rock', artist: 'Bobby Helms', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'It\'s the Most Wonderful Time of the Year', artist: 'Andy Williams', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Last Christmas', artist: 'Wham!', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'A Holly Jolly Christmas', artist: 'Burl Ives', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Christmas Song', artist: 'Nat King Cole', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Santa Claus Is Coming to Town', artist: 'Traditional', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Let It Snow! Let It Snow! Let It Snow!', artist: 'Dean Martin', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Silent Night', artist: 'Traditional', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'O Holy Night', artist: 'Traditional', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Joy to the World', artist: 'Traditional', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Hark! The Herald Angels Sing', artist: 'Traditional', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'We Wish You a Merry Christmas', artist: 'Traditional', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'O Tannenbaum', artist: 'Traditional', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Silver Bells', artist: 'Bing Crosby', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Sleigh Ride', artist: 'The Ronettes', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Walking in a Winter Wonderland', artist: 'Bing Crosby', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Santa Baby', artist: 'Eartha Kitt', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Santa Tell Me', artist: 'Ariana Grande', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Rockin\' Around the Christmas Tree', artist: 'Brenda Lee', type: 'streaming', sources: ['spotify', 'youtube'] }
            ],
            'winter-frost': [
                { title: 'Nocturne Op. 9 No. 2', artist: 'Frederic Chopin', type: 'streaming', sources: ['spotify', 'youtube', 'classicalmusic'] },
                { title: 'Mary\'s Theme', artist: 'Stelvio Cipriani', type: 'streaming', sources: ['youtube', 'spotify'] },
                { title: 'Soul Girl', artist: 'Ahmad Jamal', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Ménage à Trois', artist: 'Piero Piccioni', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Waltz of the Rain', artist: 'Frederic Chopin', type: 'streaming', sources: ['spotify', 'youtube', 'classicalmusic'] },
                { title: 'Clair de Lune', artist: 'Claude Debussy', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Für Elise', artist: 'Ludwig van Beethoven', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Winter (The Four Seasons)', artist: 'Antonio Vivaldi', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Pavane for a Dead Princess', artist: 'Maurice Ravel', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Gymnopédie No. 1', artist: 'Erik Satie', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Lark Ascending', artist: 'Ralph Vaughan Williams', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Meditation from Thaïs', artist: 'Jules Massenet', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Arabesque No. 1', artist: 'Claude Debussy', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Moonlight Sonata', artist: 'Ludwig van Beethoven', type: 'streaming', sources: ['spotify', 'youtube'] }
            ],
            'winter-romance': [
                { title: 'Nothing Without You', artist: 'MARS ARGO', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Venus as a Boy', artist: 'Björk', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Lover\'s Rock (Full Album)', artist: 'Sade', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Vespertine (Full Album)', artist: 'Björk', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Pinkerton (Full Album)', artist: 'Weezer', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Bang Bang Bang', artist: 'Sohodolls', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Le Altre 10 (Full Album)', artist: 'Piero Piccioni', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'All the Things She Said', artist: 'Sade', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'It Never Rains', artist: 'Sade', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Heart Don\'t Break Wrong', artist: 'Björk', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Perfect Situation', artist: 'Weezer', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Across the Universe', artist: 'Piero Piccioni', type: 'streaming', sources: ['youtube', 'spotify'] },
                { title: 'Cherry Blossom Girl', artist: 'Weezer', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Soft Touch', artist: 'MARS ARGO', type: 'streaming', sources: ['spotify', 'youtube'] }
            ],
            'spring': [
                { title: 'Sensual (Full Album)', artist: 'Piero Piccioni', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Lujon (Full Album)', artist: 'Henry Mancini', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Souvlaki (Full Album)', artist: 'Slowdive', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Since I Left You (Full Album)', artist: 'The Avalanches', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Perfect LUV Tape (Full Album)', artist: 'Lil Uzi Vert', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Die Lit (Full Album)', artist: 'Playboi Carti', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Graduation (Full Album)', artist: 'Kanye West', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Close to the Edge (Full Album)', artist: 'Yes', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Blue Album (Full Album)', artist: 'Weezer', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Lamp is Low', artist: 'Laurindo Almeida', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Every Morning', artist: 'Sugar Ray', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Santeria', artist: 'Sublime', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Green Album (Full Album)', artist: 'Weezer', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Floating World', artist: 'Slowdive', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Beautiful Day', artist: 'U2', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'New Soul', artist: 'Yael Naim', type: 'streaming', sources: ['spotify', 'youtube'] }
            ],
            'spring-transition': [
                { title: 'Such Great Heights', artist: 'The Postal Service', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Float On', artist: 'Modest Mouse', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Such Great Heights (Alt. Version)', artist: 'Iron & Wine', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Young Folks', artist: 'Peter Bjorn and John', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Naive', artist: 'The Kooks', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Fluorescent Adolescent', artist: 'Arctic Monkeys', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Blister in the Sun', artist: 'Violent Femmes', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Take Me Out', artist: 'Franz Ferdinand', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Wonderwall', artist: 'Oasis', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Use Somebody', artist: 'Kings of Leon', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Sex on Fire', artist: 'Kings of Leon', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Electric Feel', artist: 'MGMT', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Kids', artist: 'MGMT', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Do You Wanna', artist: 'The Kooks', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Reptilia', artist: 'The Strokes', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Last Nite', artist: 'The Strokes', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'All These Things That I\'ve Done', artist: 'The Killers', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Mr. Brightside', artist: 'The Killers', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Seven Nation Army', artist: 'The White Stripes', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Fell in Love with a Girl', artist: 'The White Stripes', type: 'streaming', sources: ['spotify', 'youtube'] }
            ],
            'summer': [
                { title: 'Primo Tardimento (Full Album)', artist: 'Piero Piccioni', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Bossa Nova Party (Full Album)', artist: 'Various', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Italian Summer Playlist', artist: 'Piero Piccioni', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Discovery (Full Album)', artist: 'Daft Punk', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Luv Vs The World 2 (Full Album)', artist: 'Lil Uzi Vert', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Random Access Memory (Full Album)', artist: 'Daft Punk', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'This Is Acting (Full Album)', artist: 'Sia', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Astroworld (Full Album)', artist: 'Travis Scott', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Down', artist: 'Jay Sean', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Planet Pit (Full Album)', artist: 'Pitbull', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Orange Lounge (Full Album)', artist: 'Various', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Fly', artist: 'Sugar Ray', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Someday', artist: 'Sugar Ray', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: '14:59', artist: 'Sugar Ray', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Stereo Love', artist: 'Edward Maya & Vika Jigulina', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Jenny', artist: 'Studio Killers', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Waka Waka', artist: '2010 World Cup Official Song', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Tití Me Preguntó', artist: 'Bad Bunny', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Levitating', artist: 'Dua Lipa', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'One Dance', artist: 'Drake ft. Wizkid & Kyla', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'God\'s Plan', artist: 'Drake', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Hotline Bling', artist: 'Drake', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Kiss Me More', artist: 'Doja Cat ft. SZA', type: 'streaming', sources: ['spotify', 'youtube'] }
            ],
            'summer-late': [
                { title: 'Blinding Lights', artist: 'The Weeknd', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Sunroof', artist: 'Nicky Youre', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Dreams', artist: 'Fleetwood Mac', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Beach Bunny', artist: 'Various', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Swim', artist: 'Jack Johnson', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Lucky', artist: 'Jason Mraz ft. Colbie Caillat', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Umbrella', artist: 'Rihanna ft. Jay-Z', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Shut Up and Dance', artist: 'Walk the Moon', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Flower', artist: 'Momoland', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Senorita', artist: 'Shawn Mendes & Camila Cabello', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Shape of You', artist: 'Ed Sheeran', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Good as Hell', artist: 'Lizzo', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Break My Soul', artist: 'Beyoncé', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'As It Was', artist: 'Harry Styles', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Running Up That Hill', artist: 'Kate Bush', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Chasing Cars', artist: 'Snow Patrol', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Ocean Avenue', artist: 'Yellowcard', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Island in the Sun', artist: 'Weezer', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Complete Failure', artist: 'The Strokes', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Golden', artist: 'Harry Styles', type: 'streaming', sources: ['spotify', 'youtube'] }
            ],
            'autumn': [
                { title: 'October Playlist - Various', artist: 'Various', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Autumn Leaves', artist: 'Ed Sheeran', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Fall', artist: 'Rhye', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Pomegranates', artist: 'London Grammar', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Sunset', artist: 'The Midnight', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'November', artist: 'Taken by Trees', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Harvest Moon', artist: 'Neil Young', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'September', artist: 'Earth, Wind & Fire', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Wake Me Up When September Ends', artist: 'Green Day', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Bitter Sweet Symphony', artist: 'The Verve', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Wonderland', artist: 'Taylor Swift', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'All Too Well', artist: 'Taylor Swift', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Falling Slowly', artist: 'Glen Hansard & Markéta Irglová', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'The Night We Met', artist: 'Lord Huron', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Dreams', artist: 'Stevie Nicks', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Witchcraft', artist: 'Frank Sinatra', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Starman', artist: 'David Bowie', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'These Days', artist: 'Foo Fighters', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Blood and Bones', artist: 'The Oh Hellos', type: 'streaming', sources: ['spotify', 'youtube'] },
                { title: 'Skinny Love', artist: 'Bon Iver', type: 'streaming', sources: ['spotify', 'youtube'] }
            ]
        };

        return playlists[this.currentSeason] || playlists.autumn;
    }

    playRandomIntroSong() {
        const introSongs = [
            { title: 'Nocturne Op. 9 No. 2', artist: 'Frederic Chopin' },
            { title: 'Mary\'s Theme', artist: 'Stelvio Cipriani' },
            { title: 'Ahmad Jamal\'s Soul Girl', artist: 'Ahmad Jamal' },
            { title: 'Ménage à Trois', artist: 'Piero Piccioni' },
            { title: 'Waltz of the Rain', artist: 'Frederic Chopin' }
        ];
        const randomIntro = introSongs[Math.floor(Math.random() * introSongs.length)];
        this.updatePlayerInfo(randomIntro.title, randomIntro.artist);
    }

    initializePlayer() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.playNextTrack());
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.playPauseBtn.textContent = '▶';
        } else {
            this.audioPlayer.play();
            this.playPauseBtn.textContent = '⏸';
        }
        this.isPlaying = !this.isPlaying;
    }

    updateProgress() {
        if (this.audioPlayer.duration) {
            const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progressBar.style.width = percent + '%';
        }
    }

    updatePlayerInfo(title, artist) {
        const titleEl = this.playerInfo.querySelector('.track-title');
        const artistEl = this.playerInfo.querySelector('.track-artist');
        if (titleEl) titleEl.textContent = title;
        if (artistEl) artistEl.textContent = artist;
    }

    playNextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        const track = this.playlist[this.currentTrackIndex];
        this.updatePlayerInfo(track.title, track.artist);
        if (this.isPlaying) {
            this.audioPlayer.play();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SeasonalMusicSystem();
});