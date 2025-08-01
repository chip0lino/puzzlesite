'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import './purchase.css';

export default function PurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRenewal, setIsRenewal] = useState(false);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backpuzzle.up.railway.app/api/auth/purchase';

  const plans = [
    {
      id: 'monthly',
      name: 'Месячный доступ',
      price: 299,
      duration: '30 дней',
      features: [
        'Полный доступ к серверу',
        'Все игровые режимы',
        'Техническая поддержка',
        'Доступ к Discord серверу'
      ]
    },
    {
      id: 'quarterly',
      name: 'Квартальный доступ',
      price: 799,
      duration: '90 дней',
      originalPrice: 897,
      features: [
        'Полный доступ к серверу',
        'Все игровые режимы',
        'Техническая поддержка',
        'Доступ к Discord серверу',
        'Скидка 11%'
      ],
      popular: true
    },
    {
      id: 'yearly',
      name: 'Годовой доступ',
      price: 2999,
      duration: '365 дней',
      originalPrice: 3588,
      features: [
        'Полный доступ к серверу',
        'Все игровые режимы',
        'Техническая поддержка',
        'Доступ к Discord серверу',
        'Приоритетная поддержка',
        'Скидка 16%'
      ]
    }
  ];

  useEffect(() => {
    checkAuthStatus();
    
    // Проверяем, пришли ли мы сюда после привязки аккаунта
    if (searchParams.get('linked') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    
    // Проверяем, это ли продление доступа
    const currentUrl = window.location.href;
    if (currentUrl.includes('expired') || currentUrl.includes('renew')) {
      setIsRenewal(true);
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.log('Auth status check failed:', response.status);
        router.push('/');
        return;
      }
      
      const data = await response.json();
      console.log('Auth status data:', data);
      
      if (!data.authenticated) {
        console.log('User not authenticated');
        router.push('/');
        return;
      }
      
      if (!data.minecraft_nickname) {
        console.log('No minecraft nickname found, redirecting to link page');
        router.push('/link-minecraft');
        return;
      }
      
      // НОВАЯ ПРОВЕРКА: Если у пользователя уже есть роль игрока - перенаправляем на профиль
      if (data.has_player_role && data.minecraft_nickname) {
        console.log('User already has player role, redirecting to profile');
        router.push(`/u/${data.minecraft_nickname}`);
        return;
      }
      
      console.log('Auth status OK, user needs to purchase access');
      setAuthStatus(data);
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.push('/');
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: selectedPlan
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Purchase failed');
        } catch {
          throw new Error('Server error');
        }
      }

      const data = await response.json();
      
      // Успешная покупка - перенаправляем на профиль игрока
      alert(`${data.message}\nДобро пожаловать на сервер!`);
      router.push(`/u/${authStatus.minecraft_nickname}`);
      
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Ошибка при покупке: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      // Перенаправляем на главную
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!authStatus) {
    return (
      <>
        <Header />
        <div className="purchase-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </>
    );
  }

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <>
      <Header />
      <div className="purchase-page">
        {showSuccess && (
          <div className="success-banner">
            ✅ Minecraft аккаунт успешно привязан! Теперь выберите план доступа.
          </div>
        )}
        
        <div className="purchase-container">
          <div className="purchase-header">
            <h1>🎮 {isRenewal ? 'Продлить доступ к серверу' : 'Приобрести доступ к серверу'}</h1>
            <p>{isRenewal ? 'Ваш доступ истек. Продлите подписку для продолжения игры' : 'Выберите подходящий план для игры на наших серверах'}</p>
          </div>

          <div className="user-card">
            <div className="user-info">
              <img 
                src={`https://mc-heads.net/avatar/${authStatus.minecraft_nickname}/64`}
                alt={authStatus.minecraft_nickname}
                className="minecraft-head"
                onError={(e) => {
                  e.target.src = `https://crafatar.com/avatars/${authStatus.minecraft_nickname}?size=64&default=MHF_Steve`;
                }}
              />
              <div>
                <h3>{authStatus.minecraft_nickname}</h3>
                <p>Minecraft аккаунт подтвержден</p>
              </div>
            </div>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && <div className="popular-badge">Популярный</div>}
                
                <h3>{plan.name}</h3>
                <div className="price-section">
                  <div className="price">
                    <span className="currency">₽</span>
                    <span className="amount">{plan.price}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="original-price">₽{plan.originalPrice}</div>
                  )}
                  <div className="duration">{plan.duration}</div>
                </div>
                
                <ul className="features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <span className="checkmark">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="checkout-section">
            <div className="order-summary">
              <h3>Сводка заказа</h3>
              <div className="summary-row">
                <span>План:</span>
                <span>{selectedPlanData.name}</span>
              </div>
              <div className="summary-row">
                <span>Игрок:</span>
                <span>{authStatus.minecraft_nickname}</span>
              </div>
              <div className="summary-row total">
                <span>Итого:</span>
                <span>₽{selectedPlanData.price}</span>
              </div>
            </div>

            <button 
              className="purchase-btn"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? 'Обработка...' : `Купить за ₽${selectedPlanData.price}`}
            </button>

            <button 
              className="logout-btn"
              onClick={handleLogout}
              disabled={loading}
            >
              Выйти из аккаунта
            </button>

            <div className="payment-methods">
              <p>Принимаем к оплате:</p>
              <div className="payment-icons">
                <span>💳</span>
                <span>🏦</span>
                <span>📱</span>
                <span>🌐</span>
              </div>
            </div>

            <div className="security-note">
              <p>🔒 Ваши платежные данные защищены SSL-шифрованием</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}