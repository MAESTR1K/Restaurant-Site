// Глобальные переменные для АДМИНКИ (отдельные от сайта)
let adminData = {
    menu: [],
    orders: [],
    reservations: [],
    analytics: {
        daily: [],
        weekly: [],
        monthly: []
    }
};

// Проверка авторизации
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isLoggedIn && !window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    // Обновляем имя пользователя
    const username = localStorage.getItem('adminUsername') || 'Администратор';
    const usernameElement = document.getElementById('admin-username');
    if (usernameElement) {
        usernameElement.textContent = username;
    }
    
    return true;
}

// Выход из системы
function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'admin-login.html';
}

// Инициализация панели
function initAdminPanel() {
    // Загрузка данных АДМИНКИ
    loadAdminData();
    
    // Навигация по разделам
    initNavigation();
    
    // Инициализация модальных окон
    initModals();
    
    // Обработчики событий
    initEventListeners();
    
    // Инициализация графиков
    initCharts();
    
    // Запускаем проверку новых заказов
    startOrderChecker();
}

// Загрузка данных админки
function loadAdminData() {
    try {
        // Пробуем загрузить из localStorage АДМИНКИ
        const savedData = localStorage.getItem('adminData');
        if (savedData) {
            adminData = JSON.parse(savedData);
            console.log('Данные админки загружены:', adminData.orders.length, 'заказов');
        } else {
            // Инициализация тестовыми данными
            initSampleData();
        }
    } catch (error) {
        console.error('Ошибка загрузки данных админки:', error);
        initSampleData();
    }
}

// Инициализация тестовых данных для АДМИНКИ
function initSampleData() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    adminData = {
        menu: [
            {
                id: 1,
                name: "Террин из утки",
                price: 890,
                category: "Закуски",
                description: "Террин из утиной печени с травами и коньяком",
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1480&q=80",
                weight: "250 г",
                available: true,
                ordersToday: 12
            },
            {
                id: 2,
                name: "Луковый суп",
                price: 650,
                category: "Закуски",
                description: "Классический французский луковый суп",
                image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                weight: "350 г",
                available: true,
                ordersToday: 8
            },
            {
                id: 3,
                name: "Эскарго",
                price: 950,
                category: "Закуски",
                description: "Улитки по-бургундски с чесночным маслом и зеленью",
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                weight: "6 шт",
                available: true,
                ordersToday: 5
            },
            {
                id: 4,
                name: "Утиная ножка конфи",
                price: 1850,
                category: "Основные блюда",
                description: "Утиная ножка, томленная в собственном жире с травами",
                image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                weight: "450 г",
                available: true,
                ordersToday: 15
            }
        ],
        orders: [
            {
                id: "ORD-" + Date.now().toString().slice(-8),
                customerName: "Иван Иванов",
                phone: "+7 911 123-45-67",
                table: "5",
                items: [
                    { name: "Террин из утки", quantity: 1, price: 890 },
                    { name: "Луковый суп", quantity: 2, price: 650 },
                    { name: "Крем-брюле", quantity: 1, price: 750 }
                ],
                total: 2940,
                status: "active",
                timestamp: new Date().toISOString(),
                payment: "ожидает",
                notes: "Прошу побыстрее",
                waiter: "Анна"
            },
            {
                id: "ORD-" + (Date.now() - 1000000).toString().slice(-8),
                customerName: "Мария Петрова",
                phone: "+7 912 987-65-43",
                table: "12",
                items: [
                    { name: "Утиная ножка конфи", quantity: 1, price: 1850 },
                    { name: "Крем-брюле", quantity: 1, price: 750 },
                    { name: "Профитроли", quantity: 2, price: 850 }
                ],
                total: 4300,
                status: "completed",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                payment: "карта",
                notes: "С праздником!",
                waiter: "Сергей"
            },
            {
                id: "ORD-" + (Date.now() - 2000000).toString().slice(-8),
                customerName: "Алексей Сидоров",
                phone: "+7 913 456-78-90",
                table: "3",
                items: [
                    { name: "Беф бургиньон", quantity: 1, price: 1650 },
                    { name: "Рататуй", quantity: 1, price: 1250 }
                ],
                total: 2900,
                status: "cancelled",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                payment: "—",
                notes: "Передумал",
                waiter: "—"
            }
        ],
        reservations: [
            {
                id: 2001,
                customerName: "Алексей Смирнов",
                phone: "+7 911 123-45-67",
                date: today,
                time: "19:00",
                guests: 4,
                table: "8",
                status: "confirmed",
                notes: "День рождения",
                createdAt: new Date().toISOString()
            },
            {
                id: 2002,
                customerName: "Ольга Козлова",
                phone: "+7 912 234-56-78",
                date: today,
                time: "20:30",
                guests: 2,
                table: "5",
                status: "confirmed",
                notes: "Романтический ужин",
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 2003,
                customerName: "Дмитрий Волков",
                phone: "+7 913 345-67-89",
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                time: "18:00",
                guests: 6,
                table: "12",
                status: "pending",
                notes: "Корпоратив",
                createdAt: new Date().toISOString()
            }
        ],
        analytics: generateSampleAnalytics()
    };
    
    saveAdminData();
}

// Сохранение данных АДМИНКИ
function saveAdminData() {
    localStorage.setItem('adminData', JSON.stringify(adminData));
}

// Генерация тестовых аналитических данных
function generateSampleAnalytics() {
    const dailyData = [];
    const weeklyData = [];
    const monthlyData = [];
    
    // Генерация данных за последние 7 дней
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        dailyData.push({
            date: dateStr,
            orders: Math.floor(Math.random() * 20) + 10,
            revenue: Math.floor(Math.random() * 50000) + 20000,
            visitors: Math.floor(Math.random() * 50) + 30,
            averageCheck: Math.floor(Math.random() * 2000) + 1500
        });
    }
    
    // Генерация данных за последние 4 недели
    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weeklyData.push({
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            orders: Math.floor(Math.random() * 100) + 50,
            revenue: Math.floor(Math.random() * 300000) + 150000,
            visitors: Math.floor(Math.random() * 300) + 200,
            averageCheck: Math.floor(Math.random() * 2000) + 1500
        });
    }
    
    // Генерация данных за последние 6 месяцев
    for (let i = 5; i >= 0; i--) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthStr = month.toISOString().substring(0, 7);
        
        monthlyData.push({
            month: monthStr,
            orders: Math.floor(Math.random() * 400) + 200,
            revenue: Math.floor(Math.random() * 1200000) + 800000,
            visitors: Math.floor(Math.random() * 1200) + 800,
            averageCheck: Math.floor(Math.random() * 2000) + 1500,
            popularDish: ["Террин из утки", "Утиная ножка конфи", "Крем-брюле", "Беф бургиньон", "Луковый суп"][Math.floor(Math.random() * 5)]
        });
    }
    
    return { daily: dailyData, weekly: weeklyData, monthly: monthlyData };
}

// Навигация по разделам
function initNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс у всех
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Добавляем активный класс текущему
            this.classList.add('active');
            
            // Показываем нужный раздел
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Загружаем данные для раздела
            switch(sectionId) {
                case 'dashboard':
                    loadDashboardData();
                    break;
                case 'menu':
                    loadMenuData();
                    break;
                case 'orders':
                    loadOrdersData();
                    break;
                case 'reservations':
                    loadReservationsData();
                    break;
                case 'analytics':
                    loadAnalyticsData();
                    break;
            }
        });
    });
}

// Инициализация модальных окон
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Закрытие по кнопке
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Закрытие по клику вне окна
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => modal.classList.remove('active'));
        }
    });
}

// Обработчики событий
function initEventListeners() {
    // Выход из системы
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
    }
    
    // Быстрые действия
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
    
    // Кнопка обновления
    const refreshReservations = document.getElementById('refresh-reservations');
    if (refreshReservations) {
        refreshReservations.addEventListener('click', loadReservationsData);
    }
    
    // Добавление блюда
    const addDishBtn = document.getElementById('add-dish-btn');
    if (addDishBtn) {
        addDishBtn.addEventListener('click', () => showDishModal());
    }
    
    // Фильтр категорий
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterDishes);
    }
    
    // Вкладки заказов
    const orderTabs = document.querySelectorAll('.order-tab');
    orderTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const status = this.getAttribute('data-status');
            filterOrders(status);
            
            // Обновляем активную вкладку
            orderTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Фильтры бронирований
    const dateFilter = document.getElementById('reservation-date-filter');
    const statusFilter = document.getElementById('reservation-status-filter');
    if (dateFilter) dateFilter.addEventListener('change', filterReservations);
    if (statusFilter) statusFilter.addEventListener('change', filterReservations);
    
    // Добавление бронирования
    const addReservationBtn = document.getElementById('add-reservation-btn');
    if (addReservationBtn) {
        addReservationBtn.addEventListener('click', () => showReservationModal());
    }
    
    // Аналитика
    const generateAnalyticsBtn = document.getElementById('generate-analytics-btn');
    const exportReportBtn = document.getElementById('export-report-btn');
    if (generateAnalyticsBtn) generateAnalyticsBtn.addEventListener('click', generateAnalyticsReport);
    if (exportReportBtn) exportReportBtn.addEventListener('click', exportReport);
    
    // Форма добавления блюда
    const dishForm = document.getElementById('dish-form');
    if (dishForm) {
        dishForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveDish();
        });
    }
    
    // Форма добавления бронирования
    const reservationFormModal = document.getElementById('reservation-form-modal');
    if (reservationFormModal) {
        reservationFormModal.addEventListener('submit', function(e) {
            e.preventDefault();
            saveReservation();
        });
    }
    
    // Инициализация времени в модальном окне бронирования
    initReservationTimeOptions();
}

// Инициализация опций времени для бронирования
function initReservationTimeOptions() {
    const timeSelect = document.getElementById('reservation-time-modal');
    if (!timeSelect) return;
    
    // Очищаем существующие опции
    timeSelect.innerHTML = '<option value="">Выберите время</option>';
    
    // Добавляем опции времени
    const timeSlots = [
        '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
        '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
        '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00',
        '23:30', '00:00', '00:30', '01:00', '01:30'
    ];
    
    timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

// Быстрые действия
function handleQuickAction(action) {
    switch(action) {
        case 'add-dish':
            showDishModal();
            break;
        case 'add-reservation':
            showReservationModal();
            break;
        case 'view-orders':
            document.querySelector('[data-section="orders"]').click();
            break;
        case 'generate-report':
            generateDailyReport();
            break;
    }
}

// Запуск проверки новых заказов
function startOrderChecker() {
    // Проверяем каждые 5 секунд
    setInterval(checkForNewOrders, 5000);
    
    // Первая проверка
    checkForNewOrders();
}

// Проверка новых заказов
function checkForNewOrders() {
    // Обновляем счетчики
    updateOrderCounts();
    
    // Если мы на странице заказов - обновляем список
    if (document.querySelector('#orders-section.active')) {
        loadOrdersData();
    }
    
    // Если на дашборде - обновляем статистику
    if (document.querySelector('#dashboard-section.active')) {
        loadDashboardData();
    }
    
    // Показываем уведомление о новых заказах
    showNewOrderNotification();
}

// Показать уведомление о новых заказах
function showNewOrderNotification() {
    const activeOrders = adminData.orders.filter(o => o.status === 'active');
    const notificationCount = activeOrders.length;
    
    // Обновляем счетчик в заголовке
    const orderTab = document.querySelector('[data-section="orders"]');
    if (orderTab) {
        const countSpan = orderTab.querySelector('.order-count') || document.createElement('span');
        countSpan.className = 'order-count';
        countSpan.textContent = ` (${notificationCount})`;
        
        if (!orderTab.querySelector('.order-count')) {
            orderTab.appendChild(countSpan);
        } else {
            orderTab.querySelector('.order-count').textContent = ` (${notificationCount})`;
        }
    }
    
    // Обновляем счетчик во вкладке
    const activeTab = document.querySelector('.order-tab[data-status="active"] span');
    if (activeTab) {
        activeTab.textContent = notificationCount;
    }
    
    // Если есть активные заказы - показываем плавающее уведомление
    if (notificationCount > 0 && !document.getElementById('new-order-notification')) {
        const notification = document.createElement('div');
        notification.id = 'new-order-notification';
        notification.className = 'floating-notification';
        notification.innerHTML = `
            <i class="fas fa-bell"></i>
            <span>Новые заказы: ${notificationCount}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        document.body.appendChild(notification);
        
        // Автоматическое скрытие через 10 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
}

// ==================== ДАШБОРД ====================

function loadDashboardData() {
    // Статистика за сегодня
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = adminData.orders.filter(order => 
        order.timestamp.split('T')[0] === today
    );
    
    // Обновляем статистику
    const todayOrdersElement = document.getElementById('today-orders');
    const todayVisitorsElement = document.getElementById('today-visitors');
    const todayRevenueElement = document.getElementById('today-revenue');
    const tableOccupancyElement = document.getElementById('table-occupancy');
    
    if (todayOrdersElement) todayOrdersElement.textContent = todayOrders.length;
    if (todayVisitorsElement) todayVisitorsElement.textContent = calculateVisitors(todayOrders);
    if (todayRevenueElement) todayRevenueElement.textContent = calculateTodayRevenue(todayOrders).toLocaleString('ru-RU') + ' руб.';
    if (tableOccupancyElement) tableOccupancyElement.textContent = calculateTableOccupancy() + '%';
    
    // Загружаем последние бронирования
    loadRecentReservations();
    
    // Загружаем популярные блюда
    loadPopularDishes();
}

function calculateVisitors(orders) {
    return orders.reduce((total, order) => {
        // Предполагаем, что в среднем 2.5 человека на заказ
        return total + Math.floor(Math.random() * 4) + 1;
    }, 0);
}

function calculateTodayRevenue(orders) {
    return orders.reduce((total, order) => total + order.total, 0);
}

function calculateTableOccupancy() {
    const currentHour = new Date().getHours();
    let occupancy = 30;
    
    if (currentHour >= 12 && currentHour < 15) occupancy = 45;
    else if (currentHour >= 15 && currentHour < 18) occupancy = 60;
    else if (currentHour >= 18 && currentHour < 21) occupancy = 85;
    else if (currentHour >= 21 && currentHour < 23) occupancy = 95;
    
    return occupancy;
}

function loadRecentReservations() {
    const container = document.getElementById('recent-reservations');
    if (!container) return;
    
    // Сортируем по дате (сначала самые новые)
    const recentReservations = [...adminData.reservations]
        .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))
        .slice(0, 5);
    
    if (recentReservations.length === 0) {
        container.innerHTML = '<p class="empty">Нет бронирований</p>';
        return;
    }
    
    container.innerHTML = recentReservations.map(reservation => `
        <div class="reservation-item">
            <div class="reservation-info">
                <h4>${reservation.customerName}</h4>
                <p>${formatDate(reservation.date)} ${reservation.time} • ${reservation.guests} чел.</p>
            </div>
            <span class="reservation-status status-${reservation.status}">
                ${getStatusText(reservation.status)}
            </span>
        </div>
    `).join('');
}

function loadPopularDishes() {
    const container = document.getElementById('popular-dishes');
    if (!container) return;
    
    // Сортируем по количеству заказов
    const popularDishes = [...adminData.menu]
        .sort((a, b) => (b.ordersToday || 0) - (a.ordersToday || 0))
        .slice(0, 5);
    
    if (popularDishes.length === 0) {
        container.innerHTML = '<p class="empty">Нет данных</p>';
        return;
    }
    
    container.innerHTML = popularDishes.map(dish => `
        <div class="dish-item">
            <div class="dish-info">
                <h4>${dish.name}</h4>
                <p>${dish.price} руб. • ${dish.category}</p>
            </div>
            <span class="dish-orders">${dish.ordersToday || 0} зак.</span>
        </div>
    `).join('');
}

// ==================== МЕНЮ ====================

function loadMenuData() {
    const container = document.getElementById('dishes-list');
    if (!container) return;
    
    if (adminData.menu.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Меню пусто. Добавьте первое блюдо!</p></div>';
        return;
    }
    
    container.innerHTML = adminData.menu.map(dish => `
        <div class="dish-card">
            <div class="dish-image ${dish.image ? '' : 'default'}" 
                 style="${dish.image ? `background-image: url('${dish.image}')` : ''}">
                ${!dish.image ? '<i class="fas fa-utensils"></i>' : ''}
            </div>
            <div class="dish-content">
                <div class="dish-header">
                    <h3>${dish.name}</h3>
                    <span class="dish-price">${dish.price} руб.</span>
                </div>
                <span class="dish-category">${dish.category}</span>
                <p class="dish-description">${dish.description || 'Нет описания'}</p>
                <div class="dish-actions">
                    <button class="dish-edit" onclick="editDish(${dish.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="dish-delete" onclick="deleteDish(${dish.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterDishes() {
    const categoryFilter = document.getElementById('category-filter');
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    
    const container = document.getElementById('dishes-list');
    if (!container) return;
    
    let filteredDishes = adminData.menu;
    if (selectedCategory) {
        filteredDishes = adminData.menu.filter(dish => dish.category === selectedCategory);
    }
    
    if (filteredDishes.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Нет блюд в этой категории</p></div>';
        return;
    }
    
    container.innerHTML = filteredDishes.map(dish => `
        <div class="dish-card">
            <div class="dish-image ${dish.image ? '' : 'default'}" 
                 style="${dish.image ? `background-image: url('${dish.image}')` : ''}">
                ${!dish.image ? '<i class="fas fa-utensils"></i>' : ''}
            </div>
            <div class="dish-content">
                <div class="dish-header">
                    <h3>${dish.name}</h3>
                    <span class="dish-price">${dish.price} руб.</span>
                </div>
                <span class="dish-category">${dish.category}</span>
                <p class="dish-description">${dish.description || 'Нет описания'}</p>
                <div class="dish-actions">
                    <button class="dish-edit" onclick="editDish(${dish.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="dish-delete" onclick="deleteDish(${dish.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function showDishModal(dishId = null) {
    const modal = document.getElementById('dish-modal');
    const title = document.getElementById('dish-modal-title');
    const form = document.getElementById('dish-form');
    
    if (!modal || !title || !form) return;
    
    if (dishId) {
        // Редактирование существующего блюда
        const dish = adminData.menu.find(d => d.id === dishId);
        if (!dish) return;
        
        title.textContent = 'Редактировать блюдо';
        form.dataset.editId = dishId;
        
        // Заполняем форму
        document.getElementById('dish-name').value = dish.name;
        document.getElementById('dish-price').value = dish.price;
        document.getElementById('dish-category').value = dish.category;
        document.getElementById('dish-description').value = dish.description || '';
        document.getElementById('dish-image').value = dish.image || '';
        document.getElementById('dish-weight').value = dish.weight || '';
        document.getElementById('dish-available').checked = dish.available !== false;
    } else {
        // Добавление нового блюда
        title.textContent = 'Добавить блюдо';
        delete form.dataset.editId;
        form.reset();
    }
    
    modal.classList.add('active');
}

function saveDish() {
    const form = document.getElementById('dish-form');
    const dishId = form.dataset.editId;
    
    const dishData = {
        name: document.getElementById('dish-name').value.trim(),
        price: parseInt(document.getElementById('dish-price').value) || 0,
        category: document.getElementById('dish-category').value,
        description: document.getElementById('dish-description').value.trim(),
        image: document.getElementById('dish-image').value.trim(),
        weight: document.getElementById('dish-weight').value.trim(),
        available: document.getElementById('dish-available').checked
    };
    
    if (!dishData.name || !dishData.price || !dishData.category) {
        alert('Пожалуйста, заполните обязательные поля: название, цена и категория');
        return;
    }
    
    if (dishId) {
        // Обновление существующего блюда
        const index = adminData.menu.findIndex(d => d.id === parseInt(dishId));
        if (index !== -1) {
            adminData.menu[index] = {
                ...adminData.menu[index],
                ...dishData
            };
        }
    } else {
        // Добавление нового блюда
        const newId = adminData.menu.length > 0 ? Math.max(...adminData.menu.map(d => d.id)) + 1 : 1;
        adminData.menu.push({
            id: newId,
            ...dishData,
            ordersToday: 0
        });
    }
    
    saveAdminData();
    loadMenuData();
    document.getElementById('dish-modal').classList.remove('active');
    
    alert(dishId ? 'Блюдо обновлено!' : 'Блюдо добавлено!');
}

function editDish(id) {
    showDishModal(id);
}

function deleteDish(id) {
    if (confirm('Удалить это блюдо из меню?')) {
        adminData.menu = adminData.menu.filter(dish => dish.id !== id);
        saveAdminData();
        loadMenuData();
        alert('Блюдо удалено!');
    }
}

// ==================== ЗАКАЗЫ ====================

function loadOrdersData() {
    updateOrderCounts();
    filterOrders('active');
}

function updateOrderCounts() {
    const activeCount = adminData.orders.filter(o => o.status === 'active').length;
    const completedCount = adminData.orders.filter(o => o.status === 'completed').length;
    const cancelledCount = adminData.orders.filter(o => o.status === 'cancelled').length;
    
    const activeElement = document.getElementById('active-orders-count');
    const completedElement = document.getElementById('completed-orders-count');
    const cancelledElement = document.getElementById('cancelled-orders-count');
    
    if (activeElement) activeElement.textContent = activeCount;
    if (completedElement) completedElement.textContent = completedCount;
    if (cancelledElement) cancelledElement.textContent = cancelledCount;
}

function filterOrders(status) {
    const orders = status === 'active' ? 
        adminData.orders.filter(o => o.status === 'active') :
        status === 'completed' ? 
        adminData.orders.filter(o => o.status === 'completed') :
        status === 'cancelled' ? 
        adminData.orders.filter(o => o.status === 'cancelled') :
        adminData.orders;
    
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Нет заказов</p></div>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">Заказ #${order.id}</span>
                <span class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            
            <div class="order-details">
                <div class="order-detail-item">
                    <p>Клиент</p>
                    <p>${order.customerName}</p>
                </div>
                <div class="order-detail-item">
                    <p>Столик</p>
                    <p>${order.table || '—'}</p>
                </div>
                <div class="order-detail-item">
                    <p>Время</p>
                    <p>${formatTime(order.timestamp)}</p>
                </div>
                <div class="order-detail-item">
                    <p>Оплата</p>
                    <p>${order.payment === 'карта' ? 'Карта' : order.payment === 'наличные' ? 'Наличные' : 'Ожидает'}</p>
                </div>
            </div>
            
            <div class="order-items">
                <ul class="order-item-list">
                    ${order.items.map(item => `
                        <li>
                            <span>${item.name} ×${item.quantity}</span>
                            <span>${item.price * item.quantity} руб.</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="order-total-row">
                <strong>Итого: ${order.total.toLocaleString('ru-RU')} руб.</strong>
            </div>
            
            <div class="order-actions">
                ${order.status === 'active' ? `
                    <button class="btn btn-success btn-sm" onclick="completeOrder('${order.id}')">
                        <i class="fas fa-check"></i> Завершить
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.id}')">
                        <i class="fas fa-times"></i> Отменить
                    </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> Подробнее
                </button>
            </div>
        </div>
    `).join('');
}

function completeOrder(orderId) {
    const order = adminData.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        order.payment = order.payment === 'ожидает' ? 'наличные' : order.payment;
        saveAdminData();
        loadOrdersData();
        alert('Заказ завершен!');
    }
}

function cancelOrder(orderId) {
    if (confirm('Отменить этот заказ?')) {
        const order = adminData.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'cancelled';
            saveAdminData();
            loadOrdersData();
            alert('Заказ отменен!');
        }
    }
}

function viewOrderDetails(orderId) {
    const order = adminData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('order-details-modal');
    const orderIdDisplay = document.getElementById('order-id-display');
    const orderDetails = modal.querySelector('.order-details');
    
    if (!modal || !orderIdDisplay || !orderDetails) return;
    
    orderIdDisplay.textContent = orderId;
    
    orderDetails.innerHTML = `
        <div class="order-details-content">
            <div class="detail-row">
                <strong>Клиент:</strong> ${order.customerName}
            </div>
            <div class="detail-row">
                <strong>Телефон:</strong> ${order.phone || '—'}
            </div>
            <div class="detail-row">
                <strong>Столик:</strong> ${order.table || '—'}
            </div>
            <div class="detail-row">
                <strong>Дата и время:</strong> ${formatDateTime(order.timestamp)}
            </div>
            <div class="detail-row">
                <strong>Статус:</strong> <span class="status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="detail-row">
                <strong>Оплата:</strong> ${order.payment === 'карта' ? 'Карта' : order.payment === 'наличные' ? 'Наличные' : 'Ожидает'}
            </div>
            <div class="detail-row">
                <strong>Официант:</strong> ${order.waiter || '—'}
            </div>
            
            <h4>Состав заказа:</h4>
            <div class="order-items-detail">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <span>${item.name} ×${item.quantity}</span>
                        <span>${item.price * item.quantity} руб.</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-total-detail">
                <strong>Итого: ${order.total.toLocaleString('ru-RU')} руб.</strong>
            </div>
            
            ${order.notes ? `
                <div class="order-notes">
                    <strong>Примечания:</strong>
                    <p>${order.notes}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

// ==================== БРОНИРОВАНИЯ ====================

function loadReservationsData() {
    filterReservations();
}

function filterReservations() {
    const dateFilter = document.getElementById('reservation-date-filter');
    const statusFilter = document.getElementById('reservation-status-filter');
    
    const selectedDate = dateFilter ? dateFilter.value : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';
    
    let filteredReservations = adminData.reservations;
    
    // Фильтр по дате
    if (selectedDate) {
        filteredReservations = filteredReservations.filter(r => r.date === selectedDate);
    }
    
    // Фильтр по статусу
    if (selectedStatus) {
        filteredReservations = filteredReservations.filter(r => r.status === selectedStatus);
    }
    
    // Сортируем по дате и времени
    filteredReservations.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    const container = document.getElementById('reservations-list-full');
    if (!container) return;
    
    if (filteredReservations.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Нет бронирований</p></div>';
        return;
    }
    
    container.innerHTML = `
        <div class="reservation-row reservation-row-header">
            <div>Клиент</div>
            <div>Дата и время</div>
            <div>Детали</div>
            <div>Действия</div>
        </div>
        ${filteredReservations.map(reservation => `
            <div class="reservation-row">
                <div>
                    <strong>${reservation.customerName}</strong><br>
                    <small>${reservation.phone}</small>
                </div>
                <div>
                    ${formatDate(reservation.date)}<br>
                    <strong>${reservation.time}</strong>
                </div>
                <div>
                    Столик: ${reservation.table || '—'}<br>
                    Гостей: ${reservation.guests}<br>
                    Статус: <span class="status-${reservation.status}">${getStatusText(reservation.status)}</span>
                </div>
                <div class="reservation-actions">
                    <button class="btn btn-sm" onclick="editReservation(${reservation.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteReservation(${reservation.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function showReservationModal(reservationId = null) {
    const modal = document.getElementById('reservation-modal');
    const title = document.getElementById('reservation-modal-title');
    const form = document.getElementById('reservation-form-modal');
    
    if (!modal || !title || !form) return;
    
    if (reservationId) {
        // Редактирование существующего бронирования
        const reservation = adminData.reservations.find(r => r.id === reservationId);
        if (!reservation) return;
        
        title.textContent = 'Редактировать бронирование';
        form.dataset.editId = reservationId;
        
        // Заполняем форму
        document.getElementById('reservation-customer').value = reservation.customerName;
        document.getElementById('reservation-phone').value = reservation.phone;
        document.getElementById('reservation-date-modal').value = reservation.date;
        document.getElementById('reservation-time-modal').value = reservation.time;
        document.getElementById('reservation-guests-modal').value = reservation.guests;
        document.getElementById('reservation-table').value = reservation.table || '';
        document.getElementById('reservation-notes').value = reservation.notes || '';
        document.getElementById('reservation-status').value = reservation.status;
    } else {
        // Добавление нового бронирования
        title.textContent = 'Добавить бронирование';
        delete form.dataset.editId;
        form.reset();
        
        // Устанавливаем сегодняшнюю дату по умолчанию
        document.getElementById('reservation-date-modal').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
}

function saveReservation() {
    const form = document.getElementById('reservation-form-modal');
    const reservationId = form.dataset.editId;
    
    const reservationData = {
        customerName: document.getElementById('reservation-customer').value.trim(),
        phone: document.getElementById('reservation-phone').value.trim(),
        date: document.getElementById('reservation-date-modal').value,
        time: document.getElementById('reservation-time-modal').value,
        guests: document.getElementById('reservation-guests-modal').value,
        table: document.getElementById('reservation-table').value.trim() || '—',
        notes: document.getElementById('reservation-notes').value.trim(),
        status: document.getElementById('reservation-status').value,
        createdAt: new Date().toISOString()
    };
    
    if (!reservationData.customerName || !reservationData.phone || !reservationData.date || 
        !reservationData.time || !reservationData.guests) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    if (reservationId) {
        // Обновление существующего бронирования
        const index = adminData.reservations.findIndex(r => r.id === parseInt(reservationId));
        if (index !== -1) {
            adminData.reservations[index] = {
                ...adminData.reservations[index],
                ...reservationData
            };
        }
    } else {
        // Добавление нового бронирования
        const newId = adminData.reservations.length > 0 ? 
            Math.max(...adminData.reservations.map(r => r.id)) + 1 : 2001;
        adminData.reservations.push({
            id: newId,
            ...reservationData
        });
    }
    
    saveAdminData();
    loadReservationsData();
    document.getElementById('reservation-modal').classList.remove('active');
    
    alert(reservationId ? 'Бронирование обновлено!' : 'Бронирование добавлено!');
}

function editReservation(id) {
    showReservationModal(id);
}

function deleteReservation(id) {
    if (confirm('Удалить это бронирование?')) {
        adminData.reservations = adminData.reservations.filter(reservation => reservation.id !== id);
        saveAdminData();
        loadReservationsData();
        alert('Бронирование удалено!');
    }
}

// ==================== АНАЛИТИКА ====================

function loadAnalyticsData() {
    // Устанавливаем сегодняшнюю дату в фильтры
    const dateFilter = document.getElementById('analytics-period');
    if (dateFilter) {
        dateFilter.value = 'month';
    }
    
    generateAnalyticsReport();
}

function generateAnalyticsReport() {
    const period = document.getElementById('analytics-period')?.value || 'month';
    const reportType = document.getElementById('report-type')?.value || 'sales';
    
    let data = [];
    let labels = [];
    
    switch(period) {
        case 'today':
            data = adminData.analytics.daily.slice(-1);
            labels = ['Сегодня'];
            break;
        case 'week':
            data = adminData.analytics.daily.slice(-7);
            labels = data.map(d => formatDate(d.date));
            break;
        case 'month':
            data = adminData.analytics.monthly;
            labels = data.map(d => {
                const [year, month] = d.month.split('-');
                const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            });
            break;
        case 'quarter':
            // Берем последние 3 месяца
            data = adminData.analytics.monthly.slice(-3);
            labels = data.map(d => {
                const [year, month] = d.month.split('-');
                const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            });
            break;
        case 'year':
            data = adminData.analytics.monthly.slice(-12);
            labels = data.map(d => {
                const [year, month] = d.month.split('-');
                const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
                return `${monthNames[parseInt(month) - 1]}`;
            });
            break;
    }
    
    // Обновляем график
    updateChart(reportType, data, labels);
    
    // Обновляем статистику
    updateAnalyticsStats(data);
    
    // Обновляем таблицу
    updateAnalyticsTable(data, period);
}

function updateChart(reportType, data, labels) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    // Удаляем существующий график
    if (window.salesChart instanceof Chart) {
        window.salesChart.destroy();
    }
    
    let chartData = [];
    let label = '';
    let color = '';
    
    switch(reportType) {
        case 'sales':
            chartData = data.map(d => d.revenue);
            label = 'Выручка (руб.)';
            color = 'rgba(52, 152, 219, 0.8)';
            break;
        case 'visitors':
            chartData = data.map(d => d.visitors);
            label = 'Посетители';
            color = 'rgba(46, 204, 113, 0.8)';
            break;
        case 'popular':
            // Для популярных блюд используем другой тип графика
            break;
        case 'revenue':
            chartData = data.map(d => d.revenue);
            label = 'Выручка (руб.)';
            color = 'rgba(155, 89, 182, 0.8)';
            break;
    }
    
    window.salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: chartData,
                backgroundColor: color,
                borderColor: color.replace('0.8', '1'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: getReportTypeText(reportType)
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateAnalyticsStats(data) {
    if (data.length === 0) return;
    
    const latestData = data[data.length - 1];
    
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
    const averageCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString('ru-RU') + ' руб.';
    document.getElementById('total-orders').textContent = totalOrders.toLocaleString('ru-RU');
    document.getElementById('average-check').textContent = averageCheck.toLocaleString('ru-RU') + ' руб.';
    document.getElementById('top-dish').textContent = latestData.popularDish || 'Террин из утки';
}

function updateAnalyticsTable(data, period) {
    const tableBody = document.getElementById('analytics-table-body');
    if (!tableBody) return;
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>';
        return;
    }
    
    tableBody.innerHTML = data.map(item => `
        <tr>
            <td>${period === 'month' || period === 'quarter' || period === 'year' ? 
                item.month || item.date : 
                formatDate(item.date)}</td>
            <td>${item.orders}</td>
            <td>${item.visitors}</td>
            <td>${item.revenue.toLocaleString('ru-RU')} руб.</td>
            <td>${item.averageCheck.toLocaleString('ru-RU')} руб.</td>
            <td>${Math.round((item.visitors / 120) * 100)}%</td>
        </tr>
    `).join('');
}

function getReportTypeText(type) {
    const types = {
        'sales': 'Продажи',
        'visitors': 'Посетители',
        'popular': 'Популярные блюда',
        'revenue': 'Выручка'
    };
    return types[type] || type;
}

function exportReport() {
    alert('Отчет экспортирован в PDF (демо-функция)');
    // В реальном приложении здесь была бы генерация PDF
}

function generateDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = adminData.orders.filter(order => 
        order.timestamp.split('T')[0] === today
    );
    
    const revenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const ordersCount = todayOrders.length;
    const averageCheck = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;
    
    const report = `
        ОТЧЕТ ЗА ДЕНЬ: ${formatDate(today)}
        
        Количество заказов: ${ordersCount}
        Выручка: ${revenue.toLocaleString('ru-RU')} руб.
        Средний чек: ${averageCheck.toLocaleString('ru-RU')} руб.
        Активных бронирований: ${adminData.reservations.filter(r => r.date === today && r.status !== 'cancelled').length}
        
        Статус заказов:
        - Активные: ${todayOrders.filter(o => o.status === 'active').length}
        - Завершенные: ${todayOrders.filter(o => o.status === 'completed').length}
        - Отмененные: ${todayOrders.filter(o => o.status === 'cancelled').length}
        
        Популярные блюда сегодня:
        ${getPopularDishesToday()}
    `;
    
    alert(report);
}

function getPopularDishesToday() {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = adminData.orders.filter(order => 
        order.timestamp.split('T')[0] === today
    );
    
    const dishCounts = {};
    todayOrders.forEach(order => {
        order.items.forEach(item => {
            dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
        });
    });
    
    const sortedDishes = Object.entries(dishCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    return sortedDishes.map(([dish, count]) => `- ${dish}: ${count} порций`).join('\n') || 'Нет данных';
}

// ==================== ГРАФИКИ ====================

function initCharts() {
    // Инициализируем график загрузки столиков
    const occupancyCtx = document.getElementById('tableOccupancyChart');
    if (occupancyCtx) {
        const hours = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
        const occupancyData = [30, 45, 60, 55, 50, 65, 85, 95, 90, 80, 70, 60];
        
        window.occupancyChart = new Chart(occupancyCtx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Загрузка столиков (%)',
                    data: occupancyData,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'active': 'Активный',
        'completed': 'Завершен',
        'cancelled': 'Отменен',
        'pending': 'Ожидает',
        'confirmed': 'Подтвержден'
    };
    return statusMap[status] || status;
}

// Глобальные функции для использования в onclick
window.editDish = editDish;
window.deleteDish = deleteDish;
window.completeOrder = completeOrder;
window.cancelOrder = cancelOrder;
window.viewOrderDetails = viewOrderDetails;
window.editReservation = editReservation;
window.deleteReservation = deleteReservation;