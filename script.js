// --- Supabase & State Initialization ---
        const supabaseUrl = 'https://jwcqpmkxwpufywxxzxrz.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Y3FwbWt4d3B1Znl3eHh6eHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Nzk4MjMsImV4cCI6MjA3MTM1NTgyM30.ogM_U93USIpCVoseqBo9zDk0ZQqcOwFjOrSvpepkU9A';
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

        let currentUser = null;
        let currentEngineUrl = '';

        // --- Global Constants ---
        const engines = [
            { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
            { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.bing.com/favicon.ico' },
            { name: 'Baidu', url: 'https://www.baidu.com/s?wd=', icon: 'https://www.baidu.com/favicon.ico' },
            { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'https://duckduckgo.com/favicon.ico' }
        ];

        // --- DOM Elements ---
        const loginButton = document.getElementById('login-button');
        const userProfile = document.getElementById('user-profile');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const logoutButton = document.getElementById('logout-button');
        const quickLinksContainer = document.getElementById('quick-links-container');
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const searchSuggestionsContainer = document.getElementById('search-suggestions-container'); // 新增：搜索建议容器

        // --- 搜索建议API配置 ---
        const suggestionApis = {
            'Google': (query) => `http://localhost:3001/api/google-suggestions?q=${query}`,
            'Bing': (query) => `http://localhost:3001/api/bing-suggestions?q=${query}`,
            'Baidu': (query) => `http://suggestion.baidu.com/su?wd=${query}`
            // DuckDuckGo 没有直接的建议API，可以考虑不提供或使用其他方式
        };

        // --- 搜索建议功能 ---
        let suggestionTimeout;

        searchInput.addEventListener('input', () => {
            console.log('[DEBUG] Input event fired. Query:', searchInput.value);
            clearTimeout(suggestionTimeout);
            const query = searchInput.value.trim();
            if (query.length > 0) {
                suggestionTimeout = setTimeout(() => fetchSuggestions(query), 300);
            } else {
                searchSuggestionsContainer.innerHTML = '';
                searchSuggestionsContainer.classList.remove('active');
            }
        });

        async function fetchSuggestions(query) {
            console.log('[DEBUG] fetchSuggestions called with:', query);
            try {
                const suggestions = await fetchBaiduSuggestions(query);
                displaySuggestions(suggestions);
            } catch (error) {
                console.error('[DEBUG] Failed to fetch suggestions:', error);
                searchSuggestionsContainer.innerHTML = '';
                searchSuggestionsContainer.classList.remove('active');
            }
        }

        function fetchBaiduSuggestions(query) {
            console.log('[DEBUG] fetchBaiduSuggestions called with:', query);
            const script = document.createElement('script');
            return new Promise((resolve, reject) => {
                const callbackName = 'baidu_sug_callback_' + Date.now();
                console.log('[DEBUG] Created JSONP callback:', callbackName);
                window[callbackName] = function(data) {
                    console.log('[DEBUG] JSONP Callback executed. Data received:', data);
                    resolve(data.s || []);
                    delete window[callbackName];
                    document.body.removeChild(script);
                };

                script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}&cb=${callbackName}`;
                console.log('[DEBUG] JSONP script src:', script.src);
                script.onerror = () => {
                    console.error('[DEBUG] JSONP script failed to load.');
                    reject(new Error('Failed to fetch suggestions from Baidu.'));
                    delete window[callbackName];
                    if (script.parentNode) {
                        document.body.removeChild(script);
                    }
                };

                document.body.appendChild(script);
            });
        }
function displaySuggestions(suggestions) {
    console.log('[DEBUG] displaySuggestions called with:', suggestions);
    searchSuggestionsContainer.innerHTML = '';
    if (suggestions.length > 0) {
        const ul = document.createElement('ul');
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            li.addEventListener('click', () => {
                searchInput.value = suggestion;
                searchSuggestionsContainer.innerHTML = '';
                searchSuggestionsContainer.classList.remove('active');
                // Optionally, trigger search immediately
                // searchButton.click(); 
            });
            ul.appendChild(li);
        });
        searchSuggestionsContainer.appendChild(ul);
        searchSuggestionsContainer.classList.add('active');
    } else {
        searchSuggestionsContainer.classList.remove('active');
    }
}



        // 点击页面其他地方隐藏建议
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestionsContainer.contains(e.target)) {
                searchSuggestionsContainer.innerHTML = '';
                searchSuggestionsContainer.classList.remove('active');
            }
        });

        // --- DOM Elements ---
        const wallpaperDiv = document.getElementById('wallpaper-bg');
        const modalOverlay = document.getElementById('modal-overlay');
        const addLinkForm = document.getElementById('add-link-form');
        const cancelLinkButton = document.getElementById('cancel-link-button');
        const linkUrlInput = document.getElementById('link-url');
        const customSelect = document.getElementById('custom-engine-select');
        const selectedIcon = document.getElementById('selected-engine-icon');
        const customOptions = document.querySelector('.custom-options');

        // --- Helper Functions ---

        function populateSearchEngines() {
            customOptions.innerHTML = ''; // Clear existing options
            engines.forEach(engine => {
                const option = document.createElement('div');
                option.className = 'custom-option';
                option.dataset.value = engine.url;
                option.innerHTML = `<img src="${engine.icon}" alt="${engine.name}"><span>${engine.name}</span>`;
                option.addEventListener('click', () => {
                    currentEngineUrl = engine.url;
                    selectedIcon.src = engine.icon;
                    document.querySelector('.custom-select-trigger span').textContent = engine.name;
                    customSelect.classList.remove('active');
                    saveSetting('search_engine_url', currentEngineUrl); // Save selected engine
                });
                customOptions.appendChild(option);
            });
        }

        // Toggle custom select dropdown
        document.querySelector('.custom-select-trigger').addEventListener('click', () => {
            customSelect.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('active');
            }
        });

        // --- Weather Card Functionality ---
        const weatherCard = document.getElementById('weather-card');
        const weatherApiKey = '31b96cda46f3e4e765ef05b59a9d5e59';

        async function fetchWeather(lat, lon) {
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=zh_cn`);
                if (!response.ok) throw new Error('Weather data not available');
                const data = await response.json();

                weatherCard.innerHTML = `
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}" id="weather-icon">
                    <div id="weather-details">
                        <p id="weather-city">${data.name}</p>
                        <p id="weather-temp">${Math.round(data.main.temp)}°C</p>
                    </div>
                `;
                weatherCard.classList.remove('hidden');
                weatherCard.classList.add('visible');
            } catch (error) {
                console.error('Error fetching weather:', error);
                weatherCard.classList.add('hidden');
            }
        }

        function getLocationAndFetchWeather() {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchWeather(position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        // Optionally, you could try to get weather by IP or show a message
                        weatherCard.classList.add('hidden');
                    }
                );
            } else {
                console.log('Geolocation is not supported by this browser.');
                weatherCard.classList.add('hidden');
            }
        }

        addLinkForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = linkUrlInput.value.trim();
            if (url) {
                await saveQuickLink(url);
                addLinkForm.reset();
                modalOverlay.classList.add('hidden');
            }
        });

        // --- Core Functions ---

        async function updateUI(session) {
            currentUser = session ? session.user : null;

            populateSearchEngines(); // Populate search engines on UI update
            if (currentUser) {
                loginButton.classList.add('hidden');
                userProfile.classList.remove('hidden');
                userName.textContent = currentUser.user_metadata.user_name || currentUser.email;
                userAvatar.src = currentUser.user_metadata.avatar_url;
                await loadUserData();
            } else {
                loginButton.classList.remove('hidden');
                userProfile.classList.add('hidden');
                quickLinksContainer.innerHTML = '<p style="color:white; text-shadow: 0 1px 2px #000;">请先登录以查看您的快捷链接。</p>';
                currentEngineUrl = engines[0].url;
                selectedIcon.src = engines[0].icon;
                document.getElementById('selected-engine-name').textContent = engines[0].name;
                await fetchWallpaper();
            }
        }

        async function loadUserData() {
            if (!currentUser) return;
            await loadSettings();
            await loadQuickLinks();
            await fetchWallpaper(); // 用户数据加载后也加载壁纸（自动切换）
        }

        // --- Authentication ---

        async function signInWithGitHub() {
            const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'github' });
            if (error) console.error('Error signing in with GitHub:', error);
        }

        async function signOut() {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            } else {
                updateUI(null);
            }
        }

        // --- Data Management (Quick Links) ---

        async function loadQuickLinks() {
            if (!currentUser) return;
            quickLinksContainer.innerHTML = '';
            const { data, error } = await supabaseClient.from('quick_links').select('id, title, url').eq('user_id', currentUser.id);
            if (error) {
                console.error('Error loading quick links:', error);
                quickLinksContainer.innerHTML = '<p style="color:red;">加载快捷链接失败。</p>';
            } else if (data) {
                data.forEach(createQuickLinkElement);
            }
            createAddButtonElement();
        }

        async function addQuickLink(event) {
            event.preventDefault();
            if (!currentUser) return alert('请先登录！');
            const title = document.getElementById('link-title').value.trim();
            let url = linkUrlInput.value.trim();
            if (!title || !url) return;
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            const { data, error } = await supabaseClient.from('quick_links').insert({ title, url, user_id: currentUser.id }).select().single();
            if (error) {
                console.error('Error adding quick link:', error);
                alert('添加失败，请稍后再试。');
            } else if (data) {
                createQuickLinkElement(data);
                const addButton = quickLinksContainer.querySelector('.add-button');
                quickLinksContainer.appendChild(addButton);
                closeAddLinkModal();
            }
        }

        async function deleteQuickLink(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!currentUser) return;
            const linkWrapper = event.target.closest('.quick-link-item');
            const linkId = linkWrapper.dataset.id;
            if (!confirm('确定要删除这个快捷方式吗？')) return;
            const { error } = await supabaseClient.from('quick_links').delete().eq('id', linkId);
            if (error) {
                console.error('Error deleting quick link:', error);
                alert('删除失败，请稍后再试。');
            } else {
                linkWrapper.remove();
            }
        }

        // --- Data Management (Settings) ---

        async function loadSettings() {
            try {
                if (!currentUser) return; // Settings are only for logged-in users

                let { data, error } = await supabaseClient.from('settings').select('search_engine_url').eq('user_id', currentUser.id).single();

                if (error && error.code !== 'PGRST116') { // Ignore 'range not satisfiable' for no result
                    console.error('Error loading settings:', error);
                }

                let foundEngine = false;
                if (data && data.search_engine_url) {
                    const savedEngine = engines.find(e => e.url === data.search_engine_url);
                    if (savedEngine) {
                        currentEngineUrl = savedEngine.url;
                        selectedIcon.src = savedEngine.icon;
                        foundEngine = true;
                    }
                }

                if (!foundEngine) {
                    currentEngineUrl = engines[0].url;
                    selectedIcon.src = engines[0].icon;
                }
            } catch (error) {
                console.error('加载设置错误:', error);
                currentEngineUrl = engines[0].url;
                selectedIcon.src = engines[0].icon;
            }
        }

        async function saveSetting(key, value) {
            if (!currentUser) return;
            const { error } = await supabaseClient.from('settings').upsert({ user_id: currentUser.id, [key]: value }, { onConflict: 'user_id' });
            if (error) console.error(`Error saving ${key}:`, error);
        }

        // --- Event Listeners ---

        // Authentication
        loginButton.addEventListener('click', signInWithGitHub);
        logoutButton.addEventListener('click', signOut);

        // --- Search Functionality ---
        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                window.open(currentEngineUrl + encodeURIComponent(query), '_blank');
                searchSuggestionsContainer.innerHTML = '';
                searchSuggestionsContainer.classList.remove('active');
            }
        }

        searchButton.addEventListener('click', performSearch);

        // 在搜索输入框按下回车键时执行搜索
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Quick Links Modal
        document.getElementById('add-link-button').addEventListener('click', () => {
            modalOverlay.classList.remove('hidden');
            document.getElementById('add-link-modal').classList.remove('hidden');
        });
        cancelLinkButton.addEventListener('click', closeAddLinkModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeAddLinkModal();
            }
        });
        addLinkForm.addEventListener('submit', addQuickLink);

        // Custom Search Engine Select
        customSelect.addEventListener('change', (event) => {
            const selectedEngineUrl = event.target.value;
            const selectedEngine = engines.find(e => e.url === selectedEngineUrl);
            if (selectedEngine) {
                currentEngineUrl = selectedEngine.url;
                selectedIcon.src = selectedEngine.icon;
                saveSetting('search_engine_url', currentEngineUrl); // Save selected engine
            }
        });

        // Initial Load
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            updateUI(session);
        });

        // Set initial selected engine name
        document.getElementById('selected-engine-name').textContent = engines[0].name;

        supabaseClient.auth.onAuthStateChange((_event, session) => {
            updateUI(session);
        });

        // Wallpaper change interval
        setInterval(fetchWallpaper, 60 * 60 * 1000); // Every hour

        // --- UI Element Creation ---

        function generateColorFromString(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const h = hash % 360;
            return `hsla(${h}, 70%, 45%, 0.6)`;
        }

        function createQuickLinkElement(link) {
            const linkWrapper = document.createElement('div');
            linkWrapper.className = 'quick-link-item';
            linkWrapper.dataset.id = link.id;
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.target = '_blank';
            const iconElement = document.createElement('div');
            iconElement.className = 'quick-link-icon';
            const firstLetter = (link.title || '?').charAt(0).toUpperCase();
            iconElement.textContent = firstLetter;
            iconElement.style.backgroundColor = generateColorFromString(link.title || '');
            iconElement.style.backdropFilter = 'blur(3px)';
            iconElement.style.webkitBackdropFilter = 'blur(3px)';
            iconElement.style.display = 'flex';
            iconElement.style.alignItems = 'center';
            iconElement.style.justifyContent = 'center';
            iconElement.style.color = 'white';
            iconElement.style.fontSize = '20px';
            iconElement.style.fontWeight = 'bold';
            iconElement.style.textShadow = '0 1px 1px rgba(0,0,0,0.2)';

            const titleElement = document.createElement('span');
            titleElement.className = 'quick-link-title';
            titleElement.textContent = link.title;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-link-button';
            deleteButton.innerHTML = '&times;'; // &#215; is the multiplication sign
            deleteButton.onclick = deleteQuickLink;

            linkElement.appendChild(iconElement);
            linkElement.appendChild(titleElement);
            linkWrapper.appendChild(linkElement);
            linkWrapper.appendChild(deleteButton);
            quickLinksContainer.appendChild(linkWrapper);
        }

        function createAddButtonElement() {
            const addButtonWrapper = document.createElement('div');
            addButtonWrapper.className = 'quick-link-item add-button';
            addButtonWrapper.id = 'add-link-button';

            const addButtonIcon = document.createElement('div');
            addButtonIcon.className = 'quick-link-icon';
            addButtonIcon.innerHTML = '&#43;'; // Plus sign
            addButtonIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            addButtonIcon.style.backdropFilter = 'blur(3px)';
            addButtonIcon.style.webkitBackdropFilter = 'blur(3px)';
            addButtonIcon.style.display = 'flex';
            addButtonIcon.style.alignItems = 'center';
            addButtonIcon.style.justifyContent = 'center';
            addButtonIcon.style.color = 'white';
            addButtonIcon.style.fontSize = '30px';
            addButtonIcon.style.fontWeight = 'bold';
            addButtonIcon.style.textShadow = '0 1px 1px rgba(0,0,0,0.2)';

            const addButtonTitle = document.createElement('span');
            addButtonTitle.className = 'quick-link-title';
            addButtonTitle.textContent = '添加快捷方式';

            addButtonWrapper.appendChild(addButtonIcon);
            addButtonWrapper.appendChild(addButtonTitle);
            quickLinksContainer.appendChild(addButtonWrapper);
        }

        // --- Search Functionality ---

        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                window.open(currentEngineUrl + encodeURIComponent(query), '_blank');
            }
        }

        // --- Modal Functions ---

        function closeAddLinkModal() {
            modalOverlay.classList.add('hidden');
            document.getElementById('add-link-modal').classList.add('hidden');
            addLinkForm.reset();
        }

        // --- Wallpaper Functionality ---

        async function fetchWallpaper() {
            try {
                const response = await fetch('https://source.unsplash.com/random/1920x1080/?nature,landscape,city,abstract');
                if (response.ok) {
                    wallpaperDiv.style.backgroundImage = `url(${response.url})`;
                } else {
                    console.error('Failed to fetch wallpaper:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching wallpaper:', error);
            }
        }

        // --- Initializations and Event Listeners (Moved to the end for clarity) ---
            document.addEventListener('DOMContentLoaded', async () => {
                const { data, error } = await supabaseClient.auth.getSession();
                await updateUI(data.session);
            
                if (error) {
                    console.error('Error getting session:', error.message);
                }
            
                const savedEngine = localStorage.getItem('search_engine_url');
                if (savedEngine) {
                    const engine = engines.find(e => e.url === savedEngine);
                    if (engine) {
                        currentEngineUrl = engine.url;
                        selectedIcon.src = engine.icon;
                        document.querySelector('.custom-select-trigger span').textContent = engine.name;
                    }
                } else {
                    // Set default engine if none is saved
                    currentEngineUrl = engines[0].url;
                    selectedIcon.src = engines[0].icon;
                    document.querySelector('.custom-select-trigger span').textContent = engines[0].name;
                }
            
                const savedWallpaper = localStorage.getItem('wallpaper_url');
                if (savedWallpaper) {
                    document.getElementById('wallpaper-bg').style.backgroundImage = `url('${savedWallpaper}')`;
                }
            
                // Call the weather function here
                getLocationAndFetchWeather();
            });
        
            supabaseClient.auth.onAuthStateChange((event, session) => {
                updateUI(session);
            });
        }

        function createAddButtonElement() {
            const existingButton = quickLinksContainer.querySelector('.add-button');
            if (existingButton) existingButton.remove();
            const addButton = document.createElement('div');
            addButton.className = 'quick-link-item add-button';
            addButton.style.cursor = 'pointer';
            addButton.addEventListener('click', openAddLinkModal);
            const addIcon = document.createElement('div');
            addIcon.className = 'quick-link-icon';
            addIcon.textContent = '+';
            const addTitle = document.createElement('span');
            addTitle.className = 'quick-link-title';
            addTitle.textContent = '添加';
            addButton.appendChild(addIcon);
            addButton.appendChild(addTitle);
            quickLinksContainer.appendChild(addButton);
        }

        // --- UI Interaction & Misc ---

        function openAddLinkModal() {
            modalOverlay.style.display = 'flex';
        }

        function closeAddLinkModal() {
            modalOverlay.style.display = 'none';
            addLinkForm.reset();
        }

        function performSearch() {
            const query = searchInput.value.trim();
            if (query && currentEngineUrl) {
                const url = `${currentEngineUrl}${encodeURIComponent(query)}`;
                window.open(url, '_blank');
                searchSuggestionsContainer.innerHTML = '';
                searchSuggestionsContainer.classList.remove('active');
            }
        }

        async function fetchBingCNWallpaper(retryCount = 3) {
            for (let i = 0; i < retryCount; i++) {
                try {
                    const response = await fetch('http://localhost:3001/api/bing-wallpaper');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    if (data && data.images && data.images.length > 0) {
                        const imgUrl = `https://www.bing.com${data.images[0].url}`;
                        wallpaperDiv.style.backgroundImage = `url('${imgUrl}')`;
                        return imgUrl;
                    } else {
                        throw new Error('No image data found');
                    }
                } catch (error) {
                    console.error(`尝试 ${i + 1}/${retryCount} 获取必应壁纸失败:`, error);
                    if (i === retryCount - 1) {
                        wallpaperDiv.style.backgroundImage = "url('/default-background.jpg')";
                        return '/default-background.jpg';
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        async function fetchWallpaper(retryCount = 3) {
            for (let i = 0; i < retryCount; i++) {
                try {
                    const response = await fetch('http://localhost:3000/api/wallpaper');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    if (!data.images || !data.images[0] || !data.images[0].url) {
                        throw new Error('API数据结构异常');
                    }
                    return `https://www.bing.com${data.images[0].url}`;
                } catch (error) {
                    console.error(`尝试 ${i + 1}/${retryCount} 获取壁纸失败:`, error);
                    if (i === retryCount - 1) {
                        return 'default-background.jpg';
                    }
                }
            }
        }

        async function fetchLocalWallpaper(retryCount = 3) {
            for (let i = 0; i < retryCount; i++) {
                try {
                    const response = await fetch('http://localhost:3000/api/wallpaper');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    if (data && data.images && data.images.length > 0) {
                        const imgUrl = `https://www.bing.com${data.images[0].url}`;
                        wallpaperDiv.style.backgroundImage = `url('${imgUrl}')`;
                        return imgUrl;
                    } else {
                        throw new Error('No image data found');
                    }
                } catch (error) {
                    console.error(`尝试 ${i + 1}/${retryCount} 获取本地代理壁纸失败:`, error);
                    if (i === retryCount - 1) {
                        wallpaperDiv.style.backgroundImage = "url('/default-background.jpg')";
                        return '/default-background.jpg';
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        async function fetch360Wallpaper(retryCount = 3) {
            for (let i = 0; i < retryCount; i++) {
                try {
                    // 360壁纸API（示例：风景类）
                    const response = await fetch('https://api.360wbl.com/api/v1/wallpaper?type=pc&category=scenery');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    if (data && data.data && data.data.length > 0) {
                        const imgUrl = data.data[0].url;
                        wallpaperDiv.style.backgroundImage = `url('${imgUrl}')`;
                        return imgUrl;
                    } else {
                        throw new Error('No image data found');
                    }
                } catch (error) {
                    console.error(`尝试 ${i + 1}/${retryCount} 获取壁纸失败:`, error);
                    if (i === retryCount - 1) {
                        wallpaperDiv.style.backgroundImage = "url('/default-background.jpg')";
                        return '/default-background.jpg';
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        function populateAndSetupEngines() {
            const optionsContainer = document.querySelector('.custom-options');
            optionsContainer.innerHTML = ''; // Clear existing options
            engines.forEach(engine => {
                const option = document.createElement('div');
                option.classList.add('custom-option');
                option.dataset.url = engine.url;
                const img = document.createElement('img');
                img.src = engine.icon;
                img.alt = engine.name;
                const span = document.createElement('span');
                span.textContent = engine.name;
                option.appendChild(img);
                option.appendChild(span);
                optionsContainer.appendChild(option);

                option.addEventListener('click', () => {
                    currentEngineUrl = engine.url;
                    selectedIcon.src = engine.icon;
                    customSelect.classList.remove('open');
                    saveSetting('search_engine_url', engine.url);
                });
            });
        }

        // --- Event Listeners ---
        function setupEventListeners() {
            loginButton.addEventListener('click', signInWithGitHub);
            logoutButton.addEventListener('click', signOut);
            searchButton.addEventListener('click', performSearch);
            searchInput.addEventListener('keydown', (e) => e.key === 'Enter' && performSearch());
            addLinkForm.addEventListener('submit', addQuickLink);
            cancelLinkButton.addEventListener('click', closeAddLinkModal);
            modalOverlay.addEventListener('click', (e) => e.target === modalOverlay && closeAddLinkModal());
            linkUrlInput.addEventListener('blur', () => {
                let url = linkUrlInput.value.trim();
                if (url && !/^https?:\/\//i.test(url)) {
                    linkUrlInput.value = 'https://' + url;
                }
            });

            // Custom select dropdown
            const trigger = document.querySelector('.custom-select-trigger');
            trigger.addEventListener('click', () => {
                customSelect.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!customSelect.contains(e.target)) {
                    customSelect.classList.remove('open');
                }
            });
        }

        // --- Initial Load ---
        async function initialize() {
            populateAndSetupEngines();
            setupEventListeners();
            const { data: { session } } = await supabaseClient.auth.getSession();
            updateUI(session);
            await fetchWallpaper(); // 页面初始化时加载壁纸（自动切换）
            supabaseClient.auth.onAuthStateChange((_event, session) => {
                updateUI(session);
            });
        }

        document.addEventListener('DOMContentLoaded', initialize);