// Класс для карусели оффера
class OfferCarousel {
    constructor() {
        this.carousel = document.getElementById('offerCarousel');
        this.slides = document.querySelectorAll('.carousel-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
        this.playToggle = document.getElementById('autoPlayToggle');
        
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoPlay = true;
        this.autoPlayInterval = 5000; // 5 секунд
        
        this.init();
    }
    
    init() {
        if (!this.carousel) return;
        
        // Показываем первый слайд
        this.showSlide(this.currentIndex);
        
        // Навигация по точкам
        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (!this.isAnimating) {
                    this.goToSlide(index);
                }
            });
        });
        
        // Кнопки навигации
        this.prevBtn.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.prevSlide();
            }
        });
        
        this.nextBtn.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.nextSlide();
            }
        });
        
        // Автовоспроизведение
        this.playToggle.addEventListener('click', () => {
            this.toggleAutoPlay();
        });
        
        // Запуск автовоспроизведения
        if (this.autoPlay) {
            this.startAutoPlay();
        }
        
        // Пауза при наведении
        this.carousel.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });
        
        this.carousel.addEventListener('mouseleave', () => {
            if (this.autoPlay) {
                this.startAutoPlay();
            }
        });
    }
    
    showSlide(index) {
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'exiting');
        });
        
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        this.slides[index].classList.add('active');
        this.dots[index].classList.add('active');
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.isAnimating = true;
        
        // Пометка текущего слайда как выходящего
        this.slides[this.currentIndex].classList.add('exiting');
        
        // Обновление индекса
        this.currentIndex = index;
        
        // Показ нового слайда после небольшой задержки
        setTimeout(() => {
            this.showSlide(this.currentIndex);
            this.isAnimating = false;
        }, 300);
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        if (this.autoPlayIntervalId) {
            clearInterval(this.autoPlayIntervalId);
        }
        
        this.autoPlayIntervalId = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayInterval);
        
        this.playToggle.classList.remove('fa-play');
        this.playToggle.classList.add('fa-pause');
    }
    
    pauseAutoPlay() {
        if (this.autoPlayIntervalId) {
            clearInterval(this.autoPlayIntervalId);
            this.autoPlayIntervalId = null;
        }
        
        this.playToggle.classList.remove('fa-pause');
        this.playToggle.classList.add('fa-play');
    }
    
    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        
        if (this.autoPlay) {
            this.startAutoPlay();
        } else {
            this.pauseAutoPlay();
        }
    }
}

// Модальные окна
class ModalManager {
    constructor() {
        this.modals = {
            donation: document.getElementById('donationModal'),
            partner: document.getElementById('partnerModal'),
            volunteer: document.getElementById('volunteerModal'),
            success: document.getElementById('successModal')
        };
        
        this.vkChatUrl = "https://vk.com/im?sel=-176216257"; // ID группы фонда
        this.init();
    }

    init() {
        // Закрытие модалок
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target === element || e.target.classList.contains('modal-close') ||
                    e.target.classList.contains('btn-secondary')) {
                    this.closeAllModals();
                }
            });
        });

        // Открытие модалок
        document.querySelectorAll('.open-donation-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('donation');
            });
        });

        document.querySelectorAll('.open-partner-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('partner');
            });
        });

        document.querySelectorAll('.open-volunteer-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('volunteer');
            });
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Предотвращение закрытия при клике внутри модалки
        document.querySelectorAll('.modal-container').forEach(modal => {
            modal.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    openModal(modalName) {
        this.closeAllModals();
        document.body.style.overflow = 'hidden';
        this.modals[modalName].classList.add('active');
    }

    closeAllModals() {
        document.body.style.overflow = '';
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    showSuccess(message = 'Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.') {
        document.getElementById('successMessage').textContent = message;
        this.openModal('success');
    }
}

// Обработчик пожертвований
class DonationHandler {
    constructor() {
        this.donationForm = document.getElementById('donationForm');
        this.submitBtn = document.getElementById('submitDonation');
        this.modalManager = null;
        
        this.init();
    }
    
    setModalManager(manager) {
        this.modalManager = manager;
    }

    init() {
        this.submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.processDonation();
        });
    }
    
    processDonation() {
        if (!this.donationForm.checkValidity()) {
            this.donationForm.reportValidity();
            return;
        }
        
        const amount = document.getElementById('donationAmount').value;
        const name = document.getElementById('donorName').value;
        const email = document.getElementById('donorEmail').value;
        const sendReceipt = document.getElementById('sendReceipt').checked;
        
        // Формируем сообщение для ВК
        const message = `Пожертвование от ${name}\nСумма: ${amount} ₽\nEmail: ${email || 'не указан'}\nКвитанция: ${sendReceipt ? 'да' : 'нет'}`;
        
        // Кодируем сообщение для URL
        const encodedMessage = encodeURIComponent(message);
        
        // Перенаправляем в чат ВК с сообщением
        const vkUrl = `${this.modalManager.vkChatUrl}&text=${encodedMessage}`;
        
        // Закрываем модалку
        this.modalManager.closeAllModals();
        
        // Открываем чат ВК в новой вкладке
        window.open(vkUrl, '_blank');
        
        // Показываем уведомление
        setTimeout(() => {
            this.modalManager.showSuccess('Спасибо за ваше пожертвование! Для завершения перейдите в чат ВКонтакте.');
        }, 500);
    }
}

// Обработчик партнёрства
class PartnerHandler {
    constructor() {
        this.partnerForm = document.getElementById('partnerForm');
        this.submitBtn = document.getElementById('submitPartnerForm');
        this.modalManager = null;
        
        this.init();
    }
    
    setModalManager(manager) {
        this.modalManager = manager;
    }

    init() {
        this.submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }
    
    submitForm() {
        if (!this.partnerForm.checkValidity()) {
            this.partnerForm.reportValidity();
            return;
        }
        
        // Здесь должна быть отправка формы на сервер
        // Для демонстрации просто показываем успешное сообщение
        
        const formData = {
            name: document.getElementById('partnerName').value,
            position: document.getElementById('partnerPosition').value,
            organization: document.getElementById('partnerOrganization').value,
            phone: document.getElementById('partnerPhone').value,
            email: document.getElementById('partnerEmail').value,
            type: document.getElementById('partnerType').value,
            message: document.getElementById('partnerMessage').value
        };
        
        console.log('Партнёрская заявка:', formData);
        
        // Закрываем текущую модалку
        this.modalManager.closeAllModals();
        
        // Показываем успешное сообщение
        setTimeout(() => {
            this.modalManager.showSuccess();
        }, 300);
        
        // Очищаем форму
        this.partnerForm.reset();
    }
}

// Обработчик волонтёрства
class VolunteerHandler {
    constructor() {
        this.volunteerForm = document.getElementById('volunteerForm');
        this.submitBtn = document.getElementById('submitVolunteerForm');
        this.modalManager = null;
        
        this.init();
    }
    
    setModalManager(manager) {
        this.modalManager = manager;
    }

    init() {
        this.submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }
    
    submitForm() {
        if (!this.volunteerForm.checkValidity()) {
            this.volunteerForm.reportValidity();
            return;
        }
        
        // Здесь должна быть отправка формы на сервер
        // Для демонстрации просто показываем успешное сообщение
        
        const selectedInterests = Array.from(document.getElementById('volunteerInterests').selectedOptions)
            .map(option => option.value);
        
        const formData = {
            name: document.getElementById('volunteerName').value,
            age: document.getElementById('volunteerAge').value,
            city: document.getElementById('volunteerCity').value,
            phone: document.getElementById('volunteerPhone').value,
            email: document.getElementById('volunteerEmail').value,
            interests: selectedInterests,
            experience: document.getElementById('volunteerExperience').value
        };
        
        console.log('Волонтёрская заявка:', formData);
        
        // Закрываем текущую модалку
        this.modalManager.closeAllModals();
        
        // Показываем успешное сообщение
        setTimeout(() => {
            this.modalManager.showSuccess();
        }, 300);
        
        // Очищаем форму
        this.volunteerForm.reset();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация карусели
    new OfferCarousel();
    
    // Инициализация модальных окон
    const modalManager = new ModalManager();
    
    // Инициализация обработчиков форм
    const donationHandler = new DonationHandler();
    const partnerHandler = new PartnerHandler();
    const volunteerHandler = new VolunteerHandler();
    
    // Передаем менеджер модалок обработчикам
    donationHandler.setModalManager(modalManager);
    partnerHandler.setModalManager(modalManager);
    volunteerHandler.setModalManager(modalManager);
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.startsWith('#')) {
                e.preventDefault();
                const targetId = href === '#' ? '' : href.substring(1);
                if (targetId) {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });
    
    // Кнопка "Наверх"
    const btnUp = {
        el: document.querySelector('.btn-up'),
        show() {
            this.el.classList.remove('btn-up_hide');
        },
        hide() {
            this.el.classList.add('btn-up_hide');
        },
        addEventListener() {
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                scrollY > 400 ? this.show() : this.hide();
            });
            
            document.querySelector('.btn-up').onclick = () => {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    if (btnUp.el) {
        btnUp.addEventListener();
    }
    
    // Обновление копирайта
    const copyrightElement = document.querySelector('.footer-copyright p');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.innerHTML = `&copy; ${currentYear} Фонд «Земля Вологодская». Все права защищены.`;
    }
});