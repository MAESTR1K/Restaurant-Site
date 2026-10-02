// Глобальное хранилище заказа для САЙТА
window.restaurantOrder = {
    items: [],
    total: 0,
    
    // Сохранение заказа в localStorage САЙТА
    saveToStorage: function() {
        const orderData = {
            items: this.items,
            total: this.total,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('siteOrder', JSON.stringify(orderData)); // ИМЯ ИЗМЕНЕНО
    },
    
    // Загрузка заказа из localStorage САЙТА
    loadFromStorage: function() {
        const savedOrder = localStorage.getItem('siteOrder'); // ИМЯ ИЗМЕНЕНО
        if (savedOrder) {
            try {
                const orderData = JSON.parse(savedOrder);
                this.items = orderData.items || [];
                this.total = orderData.total || 0;
                return true;
            } catch (e) {
                console.error('Error loading order from storage:', e);
                this.clear();
            }
        }
        return false;
    },
    
    // Очистка заказа
    clear: function() {
        this.items = [];
        this.total = 0;
        localStorage.removeItem('siteOrder'); // ИМЯ ИЗМЕНЕНО
    },
    
    // Добавление товара в заказ
    addItem: function(item) {
        // Проверяем, есть ли уже такой товар в заказе
        const existingItemIndex = this.items.findIndex(i => i.id === item.id);
        
        if (existingItemIndex !== -1) {
            // Если товар уже есть, увеличиваем количество
            this.items[existingItemIndex].quantity += item.quantity || 1;
        } else {
            // Если товара нет, добавляем новый
            this.items.push({
                ...item,
                quantity: item.quantity || 1
            });
        }
        
        this.calculateTotal();
        this.saveToStorage();
    },
    
    // Удаление товара из заказа
    removeItem: function(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.calculateTotal();
        this.saveToStorage();
    },
    
    // Обновление количества товара
    updateQuantity: function(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
            this.calculateTotal();
            this.saveToStorage();
        }
    },
    
    // Расчет общей суммы
    calculateTotal: function() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    },
    
    // Получение количества товаров в заказе
    getItemCount: function() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт ресторана "Иль-де-франс" загружен');
    
    // Загрузка заказа из хранилища САЙТА
    window.restaurantOrder.loadFromStorage();
    
    // Активация текущей страницы в навигации
    highlightCurrentPage();
    
    // Инициализация компонентов
    initReservationForm();
    initMenuSelection();
    initCheckGeneration();
    
    // Показ уведомления о времени работы
    showOpeningHoursNotification();
    
    // Обновление счетчика товаров в корзине
    updateCartCount();
});

// Подсветка текущей страницы в навигации
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Обновление счетчика товаров в корзине
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const itemCount = window.restaurantOrder.getItemCount();
    
    cartCountElements.forEach(element => {
        if (itemCount > 0) {
            element.textContent = itemCount;
            element.style.display = 'inline-flex';
        } else {
            element.style.display = 'none';
        }
    });
}

// Показ уведомления о времени работы
function showOpeningHoursNotification() {
    const now = new Date();
    const day = now.getDay(); // 0 - воскресенье, 1 - понедельник, ...
    const hour = now.getHours();
    
    let isOpen = false;
    
    if (day >= 1 && day <= 4) { // Пн-Чт
        if (hour >= 11 && hour < 20) isOpen = true;
    } else if (day === 5) { // Пт
        if (hour >= 11 || hour < 2) isOpen = true;
    } else if (day === 6) { // Сб
        if (hour >= 17 || hour < 2) isOpen = true;
    }
    
    if (!isOpen && !document.getElementById('hours-notification')) {
        const notification = document.createElement('div');
        notification.id = 'hours-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-brown);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            max-width: 300px;
        `;
        notification.innerHTML = `
            <p><i class="fas fa-clock"></i> <strong>Сейчас закрыто</strong></p>
            <p>Часы работы: Пн-Чт 11:30-19:30, Пт 11:30-02:00, Сб 17:00-02:00</p>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                position: absolute;
                top: 5px;
                right: 5px;
                cursor: pointer;
            ">×</button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
}

// Инициализация формы бронирования
function initReservationForm() {
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        // Устанавливаем минимальную дату (сегодня)
        const dateInput = document.getElementById('reservation-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
        
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные формы
            const formData = {
                date: document.getElementById('reservation-date').value,
                time: document.getElementById('reservation-time').value,
                guests: document.getElementById('reservation-guests').value,
                phone: document.getElementById('reservation-phone').value,
                name: document.getElementById('reservation-name').value,
                email: document.getElementById('reservation-email').value,
                comments: document.getElementById('reservation-comments').value
            };
            
            // Проверяем обязательные поля
            if (!formData.date || !formData.time || !formData.guests || !formData.phone || !formData.name) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            // Сохраняем бронирование в админку
            saveReservationToAdmin(formData);
            
            // Показываем уведомление
            showNotification('Бронирование отправлено! Мы свяжемся с вами для подтверждения.', 'success');
            
            // Очищаем форму
            reservationForm.reset();
        });
    }
}

// Сохранение бронирования в админку
function saveReservationToAdmin(formData) {
    try {
        // Получаем текущие данные админки
        let adminData = localStorage.getItem('adminData');
        let adminReservations = [];
        
        if (adminData) {
            try {
                const parsedData = JSON.parse(adminData);
                adminReservations = parsedData.reservations || [];
            } catch (e) {
                console.error('Ошибка парсинга adminData:', e);
                adminReservations = [];
            }
        }
        
        // Создаем новое бронирование
        const newReservation = {
            id: 2000 + adminReservations.length + 1,
            customerName: formData.name,
            phone: formData.phone,
            date: formData.date,
            time: formData.time,
            guests: formData.guests,
            table: '—',
            status: 'pending',
            notes: formData.comments || '',
            createdAt: new Date().toISOString()
        };
        
        // Добавляем новое бронирование
        adminReservations.push(newReservation);
        
        // Обновляем данные админки
        if (adminData) {
            const parsedData = JSON.parse(adminData);
            parsedData.reservations = adminReservations;
            localStorage.setItem('adminData', JSON.stringify(parsedData));
        } else {
            // Если данных админки нет - создаем
            const newAdminData = {
                orders: [],
                menu: [],
                reservations: [newReservation],
                analytics: { daily: [], weekly: [], monthly: [] }
            };
            localStorage.setItem('adminData', JSON.stringify(newAdminData));
        }
        
        console.log('Бронирование сохранено в админку:', newReservation);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения бронирования в админку:', error);
        return false;
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    }
    
    notificationArea.appendChild(notification);
    
    // Обработчик закрытия
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.remove();
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Инициализация выбора блюд в меню
function initMenuSelection() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (menuItems.length > 0) {
        // Загрузка существующего заказа
        loadOrderToMenu();
        
        // Обработчик для кнопок добавления в заказ
        menuItems.forEach(item => {
            const addButton = item.querySelector('.add-to-order');
            
            if (addButton) {
                // Удаляем существующие обработчики
                addButton.replaceWith(addButton.cloneNode(true));
                const newButton = item.querySelector('.add-to-order');
                
                newButton.addEventListener('click', function() {
                    const itemId = item.dataset.id;
                    const itemName = item.dataset.name;
                    const itemPrice = parseInt(item.dataset.price);
                    
                    // Добавление в глобальный заказ САЙТА
                    window.restaurantOrder.addItem({
                        id: itemId,
                        name: itemName,
                        price: itemPrice
                    });
                    
                    // Обновление интерфейса
                    updateOrderSummary();
                    updateCartCount();
                    
                    // Анимация добавления
                    this.innerHTML = '<i class="fas fa-check"></i> Добавлено';
                    this.classList.add('added');
                    
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-plus"></i> Добавить';
                        this.classList.remove('added');
                    }, 1500);
                });
            }
        });
        
        // Очистка заказа
        const clearOrderBtn = document.getElementById('clear-order');
        if (clearOrderBtn) {
            clearOrderBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите очистить заказ?')) {
                    window.restaurantOrder.clear();
                    updateOrderSummary();
                    updateCartCount();
                }
            });
        }
        
        // Переход к оплате
        const proceedToCheckBtn = document.getElementById('proceed-to-check');
        if (proceedToCheckBtn) {
            proceedToCheckBtn.addEventListener('click', function() {
                if (window.restaurantOrder.items.length === 0) {
                    alert('Ваш заказ пуст. Добавьте блюда из меню.');
                    return;
                }
                
                // Сохраняем заказ и переходим на страницу чека
                window.restaurantOrder.saveToStorage();
                window.location.href = 'check.html';
            });
        }
    }
}

// Загрузка заказа в интерфейс меню
function loadOrderToMenu() {
    const orderSummary = document.getElementById('order-summary');
    const totalElement = document.getElementById('order-total');
    
    if (orderSummary && totalElement) {
        updateOrderSummary();
    }
}

// Обновление сводки заказа на странице меню
function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const totalElement = document.getElementById('order-total');
    const emptyMessage = document.querySelector('.empty-order');
    
    if (!orderSummary || !totalElement) return;
    
    orderSummary.innerHTML = '';
    
    if (window.restaurantOrder.items.length === 0) {
        if (emptyMessage) {
            orderSummary.appendChild(emptyMessage.cloneNode(true));
        } else {
            orderSummary.innerHTML = '<p class="empty-order">Ваш заказ пуст. Добавьте блюда из меню.</p>';
        }
    } else {
        window.restaurantOrder.items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="order-item-info">
                    <span class="order-item-name">${item.name}</span>
                    <span class="order-item-quantity">x${item.quantity}</span>
                </div>
                <div class="order-item-actions">
                    <span class="order-item-price">${(item.price * item.quantity).toFixed(0)} руб.</span>
                    <button class="remove-order-item" data-id="${item.id}"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            orderSummary.appendChild(itemElement);
        });
        
        // Добавление обработчиков для кнопок удаления - ИСПРАВЛЕНО!
        document.querySelectorAll('.remove-order-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                window.restaurantOrder.removeItem(itemId);
                updateOrderSummary();
                updateCartCount();
            });
        });
    }
    
    totalElement.textContent = window.restaurantOrder.total.toFixed(0);
}

// Инициализация формирования чека
function initCheckGeneration() {
    // Эта функция вызывается на странице check.html
    // Основная логика находится в файле check.html
}

// ==================== ФУНКЦИИ ДЛЯ СОЗДАНИЯ ЗАКАЗА ====================

// Функция для создания заказа и передачи в админку
function createOrderAndSendToAdmin(customerData = {}) {
    try {
        // Создаем объект заказа
        const orderId = 'ORD-' + Date.now().toString().slice(-8);
        
        const order = {
            id: orderId,
            customerName: customerData.name || 'Гость',
            phone: customerData.phone || '—',
            table: customerData.table || '—',
            items: [...window.restaurantOrder.items],
            total: window.restaurantOrder.total,
            status: 'active',
            timestamp: new Date().toISOString(),
            payment: 'ожидает',
            notes: customerData.notes || '',
            waiter: customerData.waiter || '—'
        };
        
        // Сохраняем заказ в админку
        const success = saveOrderToAdmin(order);
        
        if (success) {
            // Очищаем заказ на сайте
            window.restaurantOrder.clear();
            if (typeof updateCartCount === 'function') updateCartCount();
            
            return {
                success: true,
                order: order,
                message: `Заказ #${orderId} создан успешно!`
            };
        } else {
            return {
                success: false,
                message: 'Ошибка сохранения заказа'
            };
        }
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        return {
            success: false,
            message: 'Произошла ошибка при создании заказа'
        };
    }
}

// Сохраняем заказ для админки (ОТДЕЛЬНО от данных сайта)
function saveOrderToAdmin(order) {
    try {
        // Получаем текущие заказы из АДМИНКИ
        let adminData = localStorage.getItem('adminData');
        let adminOrders = [];
        
        if (adminData) {
            try {
                const parsedData = JSON.parse(adminData);
                adminOrders = parsedData.orders || [];
            } catch (e) {
                console.error('Ошибка парсинга adminData:', e);
                adminOrders = [];
            }
        }
        
        // Добавляем новый заказ
        adminOrders.push(order);
        
        // Обновляем данные админки
        if (adminData) {
            const parsedData = JSON.parse(adminData);
            parsedData.orders = adminOrders;
            localStorage.setItem('adminData', JSON.stringify(parsedData));
        } else {
            // Если данных админки нет - создаем
            const newAdminData = {
                orders: [order],
                menu: [],
                reservations: [],
                analytics: { daily: [], weekly: [], monthly: [] }
            };
            localStorage.setItem('adminData', JSON.stringify(newAdminData));
        }
        
        console.log('Заказ сохранен в админку:', order);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения заказа в админку:', error);
        return false;
    }
}

// ============================================
// ГАЛЕРЕЯ ИНТЕРЬЕРА
// ============================================

function openGallery(element) {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('gallery-modal-img');
    const captionText = document.getElementById('gallery-caption');
    
    const img = element.querySelector('img');
    const caption = element.querySelector('.gallery-overlay span').textContent;
    
    modal.classList.add('show');
    modalImg.src = img.src;
    captionText.textContent = caption;
    
    // Блокируем скролл страницы
    document.body.style.overflow = 'hidden';
}

function closeGallery() {
    const modal = document.getElementById('gallery-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeGallery();
    }
});

// Закрытие по клику на фон (уже есть в onclick)

// ============================================
// КАРТА
// ============================================

function openMapFullscreen() {
    // Создаем модалку с картой
    const modal = document.createElement('div');
    modal.className = 'map-fullscreen show';
    modal.id = 'map-fullscreen';
    
    modal.innerHTML = `
        <div class="map-fullscreen-content">
            <span class="map-fullscreen-close" onclick="closeMapFullscreen()">&times;</span>
            <iframe 
                src="https://yandex.ru/map-widget/v1/?um=constructor%3A1a2b3c4d5e6f7g8h9i0j&amp;source=constructor" 
                width="100%" 
                height="100%" 
                frameborder="0"
                allowfullscreen="true"
                style="border:0;">
            </iframe>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Закрытие по клику на фон
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeMapFullscreen();
        }
    });
}

function closeMapFullscreen() {
    const modal = document.getElementById('map-fullscreen');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMapFullscreen();
    }
});