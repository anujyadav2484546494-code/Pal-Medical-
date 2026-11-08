// Pal Medical Store - Three Dedicated Portals Architecture
// 1. Customer Portal (Online Medicines & Ordering)
// 2. Staff Portal (Counter Operations, POS, Daily Sales Bills & Due Payments)
// 3. Admin Portal (Master Control - ONLY Admin can register staff and issue Staff IDs & Passwords)
// Store-specific contact, license, payment, customer, and account data is not included.

const { useState, useEffect, useMemo, useRef } = React;

function App() {
  // --- Persistent Core Data ---
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('pal_medicines');
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('pal_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('pal_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('pal_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [distributors, setDistributors] = useState(() => {
    const saved = localStorage.getItem('pal_distributors');
    return saved ? JSON.parse(saved) : INITIAL_DISTRIBUTORS;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('pal_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Customer Orders Queue from Online Storefront
  const [customerOrders, setCustomerOrders] = useState(() => {
    const saved = localStorage.getItem('pal_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // ==========================================================
  // THREE DEDICATED PORTALS STATE
  // ==========================================================
  // 'customer' | 'staff' | 'admin'
  const [activePortal, setActivePortal] = useState(() => {
    const saved = localStorage.getItem('pal_active_portal');
    return saved || 'customer'; // Default is the public Customer Portal
  });

  // Authenticated Sessions
  const [staffUser, setStaffUser] = useState(() => {
    const saved = localStorage.getItem('pal_staff_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('pal_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Portal Sub-Navigation Tabs
  const [customerTab, setCustomerTab] = useState('medicines'); // 'medicines' | 'rx' | 'cart'
  const [staffTab, setStaffTab] = useState('pos'); // 'pos' | 'invoices' | 'customers' | 'inventory' | 'prescriptions'
  const [adminTab, setAdminTab] = useState('staff-register'); // 'staff-register' | 'pos' | 'invoices' | 'customers' | 'inventory' | 'distributors' | 'reports'

  // Staff Portal Login Form
  const [staffLoginId, setStaffLoginId] = useState('');
  const [staffLoginPwd, setStaffLoginPwd] = useState('');
  const [showStaffPwd, setShowStaffPwd] = useState(false);
  const [staffLoginError, setStaffLoginError] = useState('');

  // Admin Portal Login Form
  const [adminLoginId, setAdminLoginId] = useState('');
  const [adminLoginPwd, setAdminLoginPwd] = useState('');
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Admin Portal Staff Registration State (Only Admin can register staff!)
  const [issuedCredentials, setIssuedCredentials] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});

  // Customer Shopping Cart & Order Checkout
  const [storeCart, setStoreCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [orderCustomerName, setOrderCustomerName] = useState('');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderRxNotes, setOrderRxNotes] = useState('');
  const [orderPaymentMode, setOrderPaymentMode] = useState('Cash on Delivery');

  // Modals & UI States
  const [quickViewMed, setQuickViewMed] = useState(null);
  const [editingMed, setEditingMed] = useState(null);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isAddRxOpen, setIsAddRxOpen] = useState(false);
  const [invoiceForPrint, setInvoiceForPrint] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Filter States
  const [sfCategory, setSfCategory] = useState('All');
  const [sfSearch, setSfSearch] = useState('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('All');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [khataOnlyDue, setKhataOnlyDue] = useState(false);
  const [khataSearchQuery, setKhataSearchQuery] = useState('');

  // POS State (Used by both Staff and Admin)
  const [posSearch, setPosSearch] = useState('');
  const [posSearchResults, setPosSearchResults] = useState([]);
  const [posBillItems, setPosBillItems] = useState([]);
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posDoctorName, setPosDoctorName] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState('Cash');
  const [posDiscountRate, setPosDiscountRate] = useState(0);
  const [posTaxRate, setPosTaxRate] = useState(0);
  const searchInputRef = useRef(null);

  // Sync state to LocalStorage
  useEffect(() => { localStorage.setItem('pal_medicines', JSON.stringify(medicines)); }, [medicines]);
  useEffect(() => { localStorage.setItem('pal_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('pal_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('pal_prescriptions', JSON.stringify(prescriptions)); }, [prescriptions]);
  useEffect(() => { localStorage.setItem('pal_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('pal_orders', JSON.stringify(customerOrders)); }, [customerOrders]);
  useEffect(() => { localStorage.setItem('pal_active_portal', activePortal); }, [activePortal]);
  useEffect(() => {
    if (staffUser) localStorage.setItem('pal_staff_user', JSON.stringify(staffUser));
    else localStorage.removeItem('pal_staff_user');
  }, [staffUser]);
  useEffect(() => {
    if (adminUser) localStorage.setItem('pal_admin_user', JSON.stringify(adminUser));
    else localStorage.removeItem('pal_admin_user');
  }, [adminUser]);

  // Toast System
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Keyboard Shortcuts (F2: POS, F4: Search, F8: Checkout)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (activePortal === 'staff') setStaffTab('pos');
        else if (activePortal === 'admin') setAdminTab('pos');
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (activePortal === 'staff') {
          setStaffTab('pos');
          setTimeout(() => searchInputRef.current?.focus(), 60);
        } else if (activePortal === 'admin') {
          setAdminTab('pos');
          setTimeout(() => searchInputRef.current?.focus(), 60);
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        if ((activePortal === 'staff' && staffTab === 'pos') || (activePortal === 'admin' && adminTab === 'pos')) {
          handlePOSCheckout();
        }
      } else if (e.key === 'Escape') {
        setQuickViewMed(null);
        setIsCartOpen(false);
        setIsAddMedOpen(false);
        setIsAddRxOpen(false);
        setInvoiceForPrint(null);
        setIsOrderSuccessOpen(false);
        setPosSearchResults([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePortal, staffTab, adminTab, posBillItems, posCustomerName, posCustomerPhone]);

  // Currency Formatter
  const formatINR = (val) => `${STORE_CONFIG.currency}${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // SVG Fallback for Medicine Photos
  const getMedImage = (med) => {
    if (med.image && med.image.trim() !== '') return med.image;
    const color = med.requiresRx ? '%23dc2626' : '%23059669';
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f8fafc"/><circle cx="200" cy="140" r="60" fill="${color}" opacity="0.12"/><path d="M175 140h50M200 115v50" stroke="${color}" stroke-width="10" stroke-linecap="round"/><text x="200" y="235" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23334155" text-anchor="middle">${encodeURIComponent(med.name)}</text><text x="200" y="255" font-family="sans-serif" font-size="11" fill="%2364748b" text-anchor="middle">${encodeURIComponent(med.brand)}</text></svg>`;
  };

  // Expiry dates
  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60;
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // ==========================================================
  // PORTAL 1: CUSTOMER ACTIONS
  // ==========================================================
  const addToStoreCart = (med) => {
    setStoreCart(prev => {
      const idx = prev.findIndex(item => item.id === med.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { ...med, qty: 1 }];
    });
    showToast(`Added ${med.name} to online cart!`);
  };

  const updateCartQty = (id, change) => {
    setStoreCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + change;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = useMemo(() => {
    return storeCart.reduce((sum, item) => sum + (item.qty * item.price), 0);
  }, [storeCart]);

  // Customer Place Order
  const handleCustomerPlaceOrder = (e) => {
    if (e) e.preventDefault();
    if (storeCart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    const name = orderCustomerName.trim() || 'Customer';
    const phone = orderCustomerPhone.trim() || 'N/A';
    const address = orderAddress.trim() || 'Local delivery';
    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      items: [...storeCart],
      total: cartTotal,
      paymentMethod: orderPaymentMode,
      status: 'Pending Dispatch',
      rxNotes: orderRxNotes.trim() || 'OTC order'
    };

    setCustomerOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    setStoreCart([]);
    setIsCartOpen(false);
    setIsOrderSuccessOpen(true);
    showToast(`Order #${orderId} placed successfully!`, 'success');
  };

  const sendWhatsAppOrder = (customOrder = null) => {
    const order = customOrder || lastPlacedOrder;
    const items = order ? order.items : storeCart;
    const total = order ? order.total : cartTotal;
    const custName = order ? order.customerName : (orderCustomerName || 'Valued Patient');
    const loc = order ? order.deliveryAddress : (orderAddress || 'Doorstep Delivery');

    let msg = `*New Medicine Order - Pal Medical Store*\n`;
    msg += `------------------------------------\n`;
    if (order) msg += `*Order ID:* ${order.id}\n`;
    msg += `*Customer:* ${custName}\n`;
    msg += `*Delivery Address:* ${loc}\n\n`;
    msg += `*Medicines Ordered:*\n`;

    items.forEach((item, i) => {
      const line = item.qty * item.price;
      msg += `${i + 1}. ${item.name} (${item.unit || 'Strip'}) x ${item.qty} = ${formatINR(line)}\n`;
    });

    msg += `\n*Total Payable:* ${formatINR(total)}\n`;
    msg += `*Lead Pharmacist:* ${STORE_CONFIG.pharmacist}\n`;
    msg += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
    msg += `Please confirm availability and dispatch time. Thank you!`;

    const cleanPhone = STORE_CONFIG.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      showToast('Store WhatsApp contact is not configured.', 'error');
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    showToast('Opening the store WhatsApp contact.', 'info');
  };

  // ==========================================================
  // PORTAL 2: STAFF ACTIONS & AUTHENTICATION
  // ==========================================================
  const handleStaffLogin = (e) => {
    if (e) e.preventDefault();
    setStaffLoginError('');
    const id = staffLoginId.trim().toLowerCase();
    const pwd = staffLoginPwd.trim();

    if (!id || !pwd) {
      setStaffLoginError('Please enter Staff ID / Mobile and Password.');
      return;
    }

    const found = users.find(u => 
      (u.username.toLowerCase() === id || u.mobile === id) && 
      u.password === pwd
    );

    if (!found) {
      setStaffLoginError('Invalid Staff ID or Password. Only registered staff can access.');
      return;
    }

    setStaffUser(found);
    setStaffLoginId('');
    setStaffLoginPwd('');
    setStaffTab('pos');
    showToast(`Staff Terminal Unlocked! Welcome, ${found.name}.`, 'success');
  };

  const handleStaffLogout = () => {
    setStaffUser(null);
    showToast('Logged out of Staff Terminal.');
  };

  // ==========================================================
  // PORTAL 3: ADMIN ACTIONS & AUTHENTICATION
  // ONLY ADMIN CAN REGISTER STAFF AND GIVE ID/PASSWORD!
  // ==========================================================
  const handleAdminLogin = (e) => {
    if (e) e.preventDefault();
    setAdminLoginError('');
    const id = adminLoginId.trim().toLowerCase();
    const pwd = adminLoginPwd.trim();

    if (!id || !pwd) {
      setAdminLoginError('Please enter Admin ID and Password.');
      return;
    }

    const found = users.find(u => 
      (u.username.toLowerCase() === id || u.mobile === id) && 
      u.password === pwd && 
      u.role === 'Admin'
    );

    if (!found) {
      setAdminLoginError('Access denied. Only a registered store administrator can log in here.');
      return;
    }

    setAdminUser(found);
    setAdminLoginId('');
    setAdminLoginPwd('');
    setAdminTab('staff-register');
    showToast(`Administrator portal unlocked. Welcome, ${found.name}.`, 'success');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    showToast('Logged out of Admin Portal.');
  };

  // ONLY ADMIN CAN REGISTER STAFF AND ISSUE CREDENTIALS
  const handleAdminRegisterStaff = (e) => {
    e.preventDefault();
    if (!adminUser || adminUser.role !== 'Admin') {
      showToast('Unauthorized: only a registered administrator can manage staff.', 'error');
      return;
    }

    const form = new FormData(e.target);
    const name = form.get('name')?.trim();
    const username = form.get('username')?.trim().toLowerCase();
    const role = form.get('role');
    const mobile = form.get('mobile')?.trim();
    const qualification = form.get('qualification')?.trim() || (role === 'Admin' ? 'B.Pharm' : 'Counter Billing Staff');
    const password = form.get('password')?.trim();

    if (!name || !username || !password || !mobile) {
      alert('Please fill in all required fields.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username)) {
      alert(`Staff ID "${username}" is already assigned to an existing staff member. Please choose another.`);
      return;
    }

    const newStaff = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name,
      username,
      role,
      mobile,
      qualification,
      password,
      createdAt: new Date().toISOString().substring(0, 10),
      status: 'Active',
      issuedBy: `${adminUser.name} (Admin)`
    };

    setUsers(prev => [...prev, newStaff]);
    setIssuedCredentials(newStaff);
    showToast(`Staff registered! Official ID & Password issued for ${name}.`, 'success');
  };

  const handleDeleteStaff = (userId) => {
    if (!adminUser || adminUser.role !== 'Admin') return;
    if (userId === adminUser.id) {
      showToast('The active administrator account cannot be removed.', 'warning');
      return;
    }
    const staff = users.find(u => u.id === userId);
    if (confirm(`Revoke staff access and delete credentials for ${staff?.name} (ID: ${staff?.username})?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`Staff account ${staff?.name} deleted.`, 'warning');
    }
  };

  const togglePasswordVisibility = (id) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ==========================================================
  // COMMON SHARED POS & BILLING LOGIC
  // ==========================================================
  const handlePOSSearch = (text) => {
    setPosSearch(text);
    if (!text.trim()) {
      setPosSearchResults([]);
      return;
    }
    const q = text.toLowerCase();
    const results = medicines.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.generic.toLowerCase().includes(q) ||
      m.batchNo.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    ).slice(0, 8);
    setPosSearchResults(results);
  };

  const addMedicineToPOSBill = (med, initialQty = 1) => {
    if (med.stock <= 0) {
      showToast(`Out of stock: ${med.name}`, 'error');
      return;
    }
    setPosBillItems(prev => {
      const idx = prev.findIndex(item => item.id === med.id);
      if (idx > -1) {
        const targetQty = prev[idx].qty + initialQty;
        if (targetQty > med.stock) {
          showToast(`Cannot exceed stock (${med.stock})`, 'warning');
          return prev;
        }
        const copy = [...prev];
        copy[idx].qty = targetQty;
        return copy;
      }
      return [...prev, { ...med, qty: initialQty }];
    });
    setPosSearch('');
    setPosSearchResults([]);
    showToast(`Added ${med.name} to bill`);
  };

  const updatePOSItemQty = (index, change) => {
    setPosBillItems(prev => {
      const copy = [...prev];
      const item = copy[index];
      const newQty = item.qty + change;
      if (newQty <= 0) {
        copy.splice(index, 1);
      } else if (newQty > item.stock) {
        showToast(`Stock limit reached (${item.stock})`, 'warning');
      } else {
        copy[index].qty = newQty;
      }
      return copy;
    });
  };

  const posSubtotal = useMemo(() => {
    return posBillItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  }, [posBillItems]);

  const posDiscountAmount = (posSubtotal * posDiscountRate) / 100;
  const posTaxAmount = ((posSubtotal - posDiscountAmount) * posTaxRate) / 100;
  const posGrandTotal = Math.round(posSubtotal - posDiscountAmount + posTaxAmount);

  // Generate POS Bill Checkout
  const handlePOSCheckout = () => {
    if (posBillItems.length === 0) {
      showToast('Please add medicines before billing', 'error');
      return;
    }

    const currentOperator = activePortal === 'admin' ? 
      (adminUser ? `${adminUser.name} (Admin)` : 'Store Admin') :
      (staffUser ? `${staffUser.name} (Staff)` : 'Pharmacy Staff');

    const customerName = posCustomerName.trim() || 'Walk-in Customer';
    const customerPhone = posCustomerPhone.trim() || 'N/A';
    const doctorName = posDoctorName.trim() || 'Self / OTC';
    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = {
      id: invoiceId,
      customerName,
      customerPhone,
      doctorName,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      items: posBillItems.map(item => ({
        id: item.id,
        name: item.name,
        batchNo: item.batchNo,
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price,
        image: item.image
      })),
      subtotal: posSubtotal,
      discount: posDiscountAmount,
      tax: posTaxAmount,
      total: posGrandTotal,
      paymentMethod: posPaymentMethod,
      paymentStatus: posPaymentMethod === 'Credit (Khata)' ? 'Pending / Credit' : 'Paid',
      billedBy: currentOperator
    };

    // Deduct inventory stock
    setMedicines(prev => prev.map(m => {
      const soldItem = posBillItems.find(item => item.id === m.id);
      if (soldItem) {
        return { ...m, stock: Math.max(0, m.stock - soldItem.qty) };
      }
      return m;
    }));

    // Update Customer Khata Ledger
    if (customerPhone !== 'N/A') {
      setCustomers(prev => {
        const idx = prev.findIndex(c => c.phone === customerPhone);
        if (idx > -1) {
          const copy = [...prev];
          copy[idx].totalPurchases += posGrandTotal;
          copy[idx].loyaltyPoints += Math.floor(posGrandTotal / 50);
          if (posPaymentMethod === 'Credit (Khata)') {
            copy[idx].khataBalance += posGrandTotal;
          }
          return copy;
        } else if (customerName !== 'Walk-in Customer') {
          return [...prev, {
            id: `CUST-${String(prev.length + 1).padStart(3, '0')}`,
            name: customerName,
            phone: customerPhone,
            address: 'Local area',
            totalPurchases: posGrandTotal,
            khataBalance: posPaymentMethod === 'Credit (Khata)' ? posGrandTotal : 0,
            loyaltyPoints: Math.floor(posGrandTotal / 50),
            notes: 'Added from counter sale'
          }];
        }
        return prev;
      });
    }

    setInvoices(prev => [newInvoice, ...prev]);
    setInvoiceForPrint(newInvoice);

    // Reset bill fields
    setPosBillItems([]);
    setPosCustomerName('');
    setPosCustomerPhone('');
    setPosDoctorName('');
    setPosDiscountRate(0);
    setPosTaxRate(0);

    showToast(`Invoice ${invoiceId} generated successfully!`, 'success');
  };

  const handlePhoneLookup = (phone) => {
    setPosCustomerPhone(phone);
    if (phone.length >= 4) {
      const found = customers.find(c => c.phone.includes(phone) || c.name.toLowerCase().includes(phone.toLowerCase()));
      if (found) {
        setPosCustomerName(found.name);
        if (found.khataBalance > 0) {
          showToast(`Previous Khata balance due: ${formatINR(found.khataBalance)}`, 'warning');
        }
      }
    }
  };

  // Convert Online Customer Order into POS Bill
  const convertOrderToPOSBill = (order) => {
    if (activePortal === 'staff') setStaffTab('pos');
    else if (activePortal === 'admin') setAdminTab('pos');

    setPosCustomerName(order.customerName);
    setPosCustomerPhone(order.customerPhone);
    setPosDoctorName('Customer Online Order');
    setPosPaymentMethod(order.paymentMethod.includes('Cash') ? 'Cash' : 'UPI');

    setPosBillItems([]);
    order.items.forEach(orderItem => {
      const med = medicines.find(m => m.id === orderItem.id || m.name.toLowerCase() === orderItem.name.toLowerCase());
      if (med) {
        addMedicineToPOSBill(med, orderItem.qty);
      }
    });

    setCustomerOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Billed & Dispatched' } : o));
    showToast(`Loaded Customer Order ${order.id} into POS Bill!`);
  };

  // Settle Customer Khata Due Payment
  const settleKhata = (cust) => {
    const amountStr = prompt(
      `Settle Due Payment for: ${cust.name}\nPhone: ${cust.phone}\nCurrent Due Amount: ${formatINR(cust.khataBalance)}\n\nEnter payment amount received (₹):`,
      cust.khataBalance
    );
    if (amountStr === null) return;
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) {
      showToast('Invalid settlement amount', 'error');
      return;
    }

    setCustomers(prev => prev.map(c => {
      if (c.id === cust.id) {
        return { ...c, khataBalance: Math.max(0, c.khataBalance - val) };
      }
      return c;
    }));

    const currentOperator = activePortal === 'admin' ? 
      (adminUser ? adminUser.name : 'Store Admin') :
      (staffUser ? staffUser.name : 'Counter Staff');

    const receiptInvoice = {
      id: `SETTLE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: cust.name,
      customerPhone: cust.phone,
      doctorName: 'Khata Due Settlement',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      items: [
        {
          id: 'KHATA-PAY',
          name: `Due Payment Settlement - Remaining Balance: ${formatINR(Math.max(0, cust.khataBalance - val))}`,
          batchNo: 'SETTLE',
          qty: 1,
          price: val,
          total: val
        }
      ],
      subtotal: val,
      discount: 0,
      tax: 0,
      total: val,
      paymentMethod: 'Cash / UPI Settlement',
      paymentStatus: 'Paid',
      billedBy: currentOperator
    };

    setInvoices(prev => [receiptInvoice, ...prev]);
    setInvoiceForPrint(receiptInvoice);
    showToast(`Collected ${formatINR(val)} from ${cust.name}! Customer due updated.`, 'success');
  };

  // Restock inventory
  const quickRestock = (medId, amount = 20) => {
    setMedicines(prev => prev.map(m => m.id === medId ? { ...m, stock: m.stock + amount } : m));
    showToast(`Restocked +${amount} units.`);
  };

  // Print Invoice (Thermal or A4)
  const handlePrint = (mode = 'a4') => {
    const printable = document.getElementById('printable-invoice');
    if (!printable || !invoiceForPrint) return;
    if (mode === 'thermal') printable.classList.add('thermal-mode');
    else printable.classList.remove('thermal-mode');
    window.print();
  };

  // Save / Download Bill in PDF format (Using html2pdf.js)
  const handleSavePDF = (invoice) => {
    const target = invoice || invoiceForPrint;
    if (!target) return;

    setInvoiceForPrint(target);

    setTimeout(() => {
      const element = document.getElementById('pdf-invoice-modal-sheet');
      if (!element) {
        showToast('Invoice template not found for PDF export', 'error');
        window.print();
        return;
      }

      showToast(`Generating PDF bill for ${target.id}...`, 'info');

      if (window.html2pdf) {
        const opt = {
          margin:       [8, 8, 8, 8],
          filename:     `Pal_Medical_Bill_${target.id}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        window.html2pdf().set(opt).from(element).save()
          .then(() => {
            showToast(`Bill ${target.id} downloaded as PDF successfully!`, 'success');
          })
          .catch((err) => {
            console.error('PDF generation error:', err);
            showToast('Direct PDF export encountered an issue; opening system print dialog.', 'warning');
            window.print();
          });
      } else {
        showToast('Opening print dialog. Select "Save as PDF" to save file.', 'info');
        window.print();
      }
    }, 150);
  };

  // Categories list
  const categories = ['All', 'Pain & Fever', 'Antibiotics', 'Gastric & Acidity', 'Cold & Allergy', 'Diabetes Care', 'Cardiac & BP', 'Vitamins & Supplements', 'First Aid & Antiseptic', 'Medical Devices', 'Ayurvedic & Herbal'];

  // Filtered Storefront Medicines
  const filteredStoreMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchCat = sfCategory === 'All' || m.category === sfCategory;
      const matchSearch = m.name.toLowerCase().includes(sfSearch.toLowerCase()) ||
                          m.generic.toLowerCase().includes(sfSearch.toLowerCase()) ||
                          m.brand.toLowerCase().includes(sfSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [medicines, sfCategory, sfSearch]);

  // Filtered Daily Sales Bills
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = invoiceFilterStatus === 'All' || 
        (invoiceFilterStatus === 'Paid' && inv.paymentStatus === 'Paid') ||
        (invoiceFilterStatus === 'Due' && inv.paymentStatus !== 'Paid') ||
        (invoiceFilterStatus === inv.paymentMethod);
      const q = invoiceSearchQuery.toLowerCase();
      const matchSearch = !q || 
        inv.id.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.customerPhone && inv.customerPhone.includes(q));
      return matchStatus && matchSearch;
    });
  }, [invoices, invoiceFilterStatus, invoiceSearchQuery]);

  // Daily Sales Calculations
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayInvoices = useMemo(() => {
    return invoices.filter(inv => inv.date && inv.date.startsWith(todayStr));
  }, [invoices, todayStr]);

  const todayRevenue = useMemo(() => {
    return todayInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  }, [todayInvoices]);

  // Filtered Khata Customers (Due Payments)
  const filteredKhataCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchDue = !khataOnlyDue || c.khataBalance > 0;
      const q = khataSearchQuery.toLowerCase();
      const matchSearch = !q || 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q));
      return matchDue && matchSearch;
    });
  }, [customers, khataOnlyDue, khataSearchQuery]);

  const totalOutstandingDue = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.khataBalance || 0), 0);
  }, [customers]);

  const dueAccountsCount = useMemo(() => {
    return customers.filter(c => c.khataBalance > 0).length;
  }, [customers]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Top Verified Regulatory Notice Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 font-medium flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">{STORE_CONFIG.storeName}</span>
          <span className="hidden sm:inline text-emerald-300">•</span>
          <span className="hidden sm:inline">Lead Pharmacist: <b className="text-white">{STORE_CONFIG.pharmacist}</b></span>
          <span className="hidden md:inline text-emerald-300">•</span>
          {STORE_CONFIG.phone && <span className="hidden md:inline">Store contact: <b className="text-white">{STORE_CONFIG.phone}</b></span>}
        </div>

        <div className="flex items-center gap-3 text-xs">
          {STORE_CONFIG.dlNumber && <span className="hidden sm:inline text-emerald-300">DL: {STORE_CONFIG.dlNumber.split('/')[0]}</span>}
        </div>
      </div>

      {/* ========================================================
          2. THREE DEDICATED PORTALS SWITCHER HEADER BAR
          Allows instant switching between:
          1. Customer Portal
          2. Staff Portal
          3. Admin Portal (Only Admin can register staff!)
          ======================================================== */}
      <div className="portal-switcher-bar px-4 py-2.5 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActivePortal('customer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">{STORE_CONFIG.storeName}</h1>
                <span className="badge badge-success text-[10px]">Pharmacy Demo</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{STORE_CONFIG.address || 'Store location not configured'}</p>
            </div>
          </div>

          {/* Three Portals Switcher Pills */}
          <div className="flex items-center gap-2">
            {/* PORTAL 1: CUSTOMER PORTAL */}
            <button
              onClick={() => setActivePortal('customer')}
              className={`portal-pill portal-pill-customer ${activePortal === 'customer' ? 'active' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              <span>Customer Portal</span>
            </button>

            {/* PORTAL 2: STAFF PORTAL */}
            <button
              onClick={() => setActivePortal('staff')}
              className={`portal-pill portal-pill-staff ${activePortal === 'staff' ? 'active' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              <span>Staff Portal</span>
              {staffUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            {/* PORTAL 3: ADMIN PORTAL */}
            <button
              onClick={() => setActivePortal('admin')}
              className={`portal-pill portal-pill-admin ${activePortal === 'admin' ? 'active' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span>Admin Portal</span>
              {adminUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

          {/* Right Floating Cart Trigger (Customer Storefront) */}
          {activePortal === 'customer' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <span>Cart & Order</span>
                {storeCart.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {storeCart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          3. MAIN CONTENT CONTAINER (PORTAL DEPENDENT)
          ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 no-print">

        {/* ######################################################
            PORTAL 1: CUSTOMER PORTAL
            Customer can ONLY see medicines, details, and order!
            ###################################################### */}
        {activePortal === 'customer' && (
          <div className="space-y-6">
            {/* Customer Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-md">
                  <span>🛒 Pal Medical Store • Customer Portal</span>
                  <span>•</span>
                  <span>Authentic Medicines Guaranteed</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                  Order Genuine Medicines Online
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
                  Pharmacy contact and licensing details can be configured for your deployment.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => setIsAddRxOpen(true)} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span>Upload Doctor Prescription (Rx)</span>
                  </button>
                  {STORE_CONFIG.phone && <a href={`tel:${STORE_CONFIG.phone}`} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>Helpline: {STORE_CONFIG.phone}</span>
                  </a>}
                </div>
              </div>
            </div>

            {/* Medicine Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSfCategory(cat)}
                  className={`category-pill ${sfCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  value={sfSearch}
                  onChange={(e) => setSfSearch(e.target.value)}
                  placeholder="Search medicines by brand, generic formula, or symptom..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing <b>{filteredStoreMedicines.length}</b> authentic medicines ready for dispatch
              </div>
            </div>

            {/* Medicines Catalog Grid with Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredStoreMedicines.map(med => (
                <div key={med.id} className="medicine-card group flex flex-col justify-between">
                  <div>
                    {/* Medicine Photo */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setQuickViewMed(med)}>
                      <img 
                        src={getMedImage(med)} 
                        alt={med.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = getMedImage({ ...med, image: '' }); }}
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="badge badge-info shadow-sm">{med.category}</span>
                        {med.requiresRx && (
                          <span className="badge badge-danger shadow-sm">Rx Required</span>
                        )}
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-[10px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-full shadow-sm">
                          ★ {med.rating || '4.8'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{med.brand}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{med.unit}</span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight hover:text-emerald-700 cursor-pointer" onClick={() => setQuickViewMed(med)}>
                        {med.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 font-medium">{med.generic}</p>

                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">Uses:</span> {med.uses || 'Therapeutic medication'}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                    <div className="flex items-baseline justify-between mb-3 pt-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-emerald-700">{formatINR(med.price)}</span>
                          {med.mrp > med.price && (
                            <span className="text-xs text-slate-400 line-through">MRP {formatINR(med.mrp)}</span>
                          )}
                        </div>
                        {med.mrp > med.price && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            Save {Math.round(((med.mrp - med.price) / med.mrp) * 100)}% Off
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {med.stock > 0 ? (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setQuickViewMed(med)}
                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => addToStoreCart(med)}
                        disabled={med.stock <= 0}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${med.stock > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        <span>Add +</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ######################################################
            PORTAL 2: STAFF PORTAL
            For authorized pharmacy staff.
            Features: POS Billing, Daily Sales Bills (print & PDF),
            Due Payments (Khata ledger & collections), Stock.
            Staff CANNOT register other staff!
            ###################################################### */}
        {activePortal === 'staff' && (
          <div className="space-y-6">
            {!staffUser ? (
              /* Dedicated Staff Login Screen */
              <div className="max-w-md mx-auto react-card p-6 sm:p-8 space-y-5 border-t-4 border-blue-600 shadow-xl">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 text-2xl flex items-center justify-center mx-auto">
                    👨‍⚕️
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Staff Portal Login</h3>
                  <p className="text-xs text-slate-500">
                    For pharmacy counter staff and billing operators.
                  </p>
                </div>

                {staffLoginError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {staffLoginError}
                  </div>
                )}

                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Staff ID / Username or Mobile *</label>
                    <input
                      type="text"
                      required
                      value={staffLoginId}
                      onChange={(e) => setStaffLoginId(e.target.value)}
                      placeholder="Staff ID or mobile number"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Password *</label>
                    <div className="relative">
                      <input
                        type={showStaffPwd ? 'text' : 'password'}
                        required
                        value={staffLoginPwd}
                        onChange={(e) => setStaffLoginPwd(e.target.value)}
                        placeholder="Enter password given by Admin"
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPwd(!showStaffPwd)}
                        className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        {showStaffPwd ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Log In to Staff Terminal
                  </button>
                </form>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                  No default accounts are included. Configure secure server-side authentication before using staff features.
                </div>
              </div>
            ) : (
              /* Staff Authenticated Operations Dashboard */
              <div className="space-y-6">
                {/* Staff Header Bar */}
                <div className="flex flex-wrap justify-between items-center gap-3 bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">👨‍⚕️</span>
                    <div>
                      <div className="text-xs font-bold text-blue-950 flex items-center gap-2">
                        <span>Staff Terminal: {staffUser.name}</span>
                        <span className="badge badge-info text-[9px] uppercase">{staffUser.role}</span>
                      </div>
                      <div className="text-[11px] text-blue-700">Counter Operator • Store ID: {staffUser.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStaffLogout}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition"
                    >
                      Logout Staff
                    </button>
                  </div>
                </div>

                {/* Staff Sub-Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-2">
                  <button
                    onClick={() => setStaffTab('pos')}
                    className={`nav-tab-btn ${staffTab === 'pos' ? 'active' : ''}`}
                  >
                    <span>🛒 POS Billing Counter</span>
                    <span className="kbd-shortcut">F2</span>
                  </button>

                  <button
                    onClick={() => setStaffTab('invoices')}
                    className={`nav-tab-btn ${staffTab === 'invoices' ? 'active' : ''}`}
                  >
                    <span>📊 Daily Sales Bills ({todayInvoices.length})</span>
                  </button>

                  <button
                    onClick={() => setStaffTab('customers')}
                    className={`nav-tab-btn ${staffTab === 'customers' ? 'active' : ''}`}
                  >
                    <span>💳 Due Payments (Khata)</span>
                    {dueAccountsCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {dueAccountsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setStaffTab('inventory')}
                    className={`nav-tab-btn ${staffTab === 'inventory' ? 'active' : ''}`}
                  >
                    <span>📦 Stock & Batches</span>
                  </button>

                  <button
                    onClick={() => setStaffTab('prescriptions')}
                    className={`nav-tab-btn ${staffTab === 'prescriptions' ? 'active' : ''}`}
                  >
                    <span>📋 Customer Online Orders ({customerOrders.length})</span>
                  </button>
                </div>

                {/* STAFF SUB-VIEW 1: POS BILLING */}
                {staffTab === 'pos' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="react-card p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>Counter Billing Search</span>
                            <span className="kbd-shortcut">F4</span>
                          </h3>
                          <span className="text-xs text-slate-400 font-medium">Billed By: <b>{staffUser.name}</b></span>
                        </div>

                        <div className="relative">
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={posSearch}
                            onChange={(e) => handlePOSSearch(e.target.value)}
                            placeholder="Search medicine brand, composition, or scan barcode..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-medium"
                          />
                          {posSearchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100">
                              {posSearchResults.map(med => (
                                <div
                                  key={med.id}
                                  onClick={() => addMedicineToPOSBill(med)}
                                  className="p-3 hover:bg-blue-50/70 cursor-pointer flex justify-between items-center transition"
                                >
                                  <div>
                                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                      <span>{med.name}</span>
                                      <span className="font-mono text-[10px] text-slate-400">({med.batchNo})</span>
                                      {med.requiresRx && <span className="badge badge-danger text-[9px]">Rx</span>}
                                    </div>
                                    <div className="text-[11px] text-slate-500">{med.generic} • <span className="font-semibold text-slate-700">{med.rack}</span></div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-black text-blue-700 text-xs">{formatINR(med.price)}</div>
                                    <div className={`text-[10px] font-bold ${med.stock < med.minStock ? 'text-amber-600' : 'text-slate-400'}`}>Stock: {med.stock}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items in Bill */}
                      <div className="react-card overflow-hidden">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Medicine</th>
                              <th>Batch</th>
                              <th>Price</th>
                              <th className="text-center">Qty</th>
                              <th className="text-right">Total</th>
                              <th className="text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {posBillItems.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center py-10 text-slate-400 text-xs">
                                  No medicines added to bill yet. Press F4 to search medicines.
                                </td>
                              </tr>
                            ) : (
                              posBillItems.map((item, idx) => (
                                <tr key={item.id}>
                                  <td>
                                    <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                                    <div className="text-[10px] text-slate-400">{item.unit}</div>
                                  </td>
                                  <td className="font-mono text-xs text-slate-500">{item.batchNo}</td>
                                  <td className="font-semibold text-xs">{formatINR(item.price)}</td>
                                  <td className="text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                                      <button onClick={() => updatePOSItemQty(idx, -1)} className="w-5 h-5 bg-white rounded font-bold text-xs shadow-sm">-</button>
                                      <span className="font-black text-xs px-1">{item.qty}</span>
                                      <button onClick={() => updatePOSItemQty(idx, 1)} className="w-5 h-5 bg-white rounded font-bold text-xs shadow-sm">+</button>
                                    </div>
                                  </td>
                                  <td className="text-right font-black text-slate-900 text-xs">{formatINR(item.qty * item.price)}</td>
                                  <td className="text-right">
                                    <button onClick={() => updatePOSItemQty(idx, -item.qty)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Checkout */}
                    <div className="lg:col-span-4 react-card p-6 space-y-4">
                      <h3 className="font-black text-slate-900 text-sm pb-2 border-b">Bill Summary & Checkout</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Mobile</label>
                          <input
                            type="tel"
                            value={posCustomerPhone}
                            onChange={(e) => handlePhoneLookup(e.target.value)}
                            placeholder="10-digit mobile (Auto Khata)"
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name</label>
                          <input
                            type="text"
                            value={posCustomerName}
                            onChange={(e) => setPosCustomerName(e.target.value)}
                            placeholder="Walk-in Customer"
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Prescribing Doctor</label>
                          <input
                            type="text"
                            value={posDoctorName}
                            onChange={(e) => setPosDoctorName(e.target.value)}
                            placeholder="Self / Dr. Name"
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                          <select
                            value={posPaymentMethod}
                            onChange={(e) => setPosPaymentMethod(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                          >
                            <option value="Cash">Cash at Counter</option>
                            <option value="UPI">UPI</option>
                            <option value="Credit (Khata)">Credit Sale (Record in Khata)</option>
                            <option value="Card">Debit / Credit Card</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span>{formatINR(posSubtotal)}</span>
                          </div>
                          <div className="flex justify-between text-base font-black text-slate-900 border-t pt-2">
                            <span>Grand Total:</span>
                            <span className="text-blue-700">{formatINR(posGrandTotal)}</span>
                          </div>
                        </div>

                        <button
                          onClick={handlePOSCheckout}
                          disabled={posBillItems.length === 0}
                          className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 ${posBillItems.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                          <span>Generate Invoice & Print (F8)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAFF SUB-VIEW 2: DAILY SALES BILLS */}
                {staffTab === 'invoices' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Daily Sales Bills & Tax Invoices</h3>
                        <p className="text-xs text-slate-500">View sales transactions, print receipts, and download PDF bills.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="react-card p-4 border-l-4 border-blue-600">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Total Sales</span>
                        <div className="text-2xl font-black text-blue-900 mt-1">{formatINR(todayRevenue)}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{todayInvoices.length} invoices generated today</div>
                      </div>

                      <div className="react-card p-4 border-l-4 border-emerald-600">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Cash & UPI Settled</span>
                        <div className="text-2xl font-black text-emerald-800 mt-1">
                          {formatINR(todayInvoices.filter(i => i.paymentStatus === 'Paid').reduce((s, i) => s + i.total, 0))}
                        </div>
                      </div>

                      <div className="react-card p-4 border-l-4 border-amber-600">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Credit / Khata Sales</span>
                        <div className="text-2xl font-black text-amber-800 mt-1">
                          {formatINR(todayInvoices.filter(i => i.paymentStatus !== 'Paid').reduce((s, i) => s + i.total, 0))}
                        </div>
                      </div>
                    </div>

                    <div className="react-card overflow-hidden">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Invoice ID</th>
                            <th>Date & Time</th>
                            <th>Customer Name</th>
                            <th>Doctor</th>
                            <th>Payment Mode</th>
                            <th>Grand Total</th>
                            <th>Status</th>
                            <th className="text-right">Print & PDF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="font-mono text-xs font-bold text-blue-800">{inv.id}</td>
                              <td className="text-xs text-slate-500">{inv.date}</td>
                              <td>
                                <div className="font-bold text-slate-900 text-xs">{inv.customerName}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{inv.customerPhone}</div>
                              </td>
                              <td className="text-xs text-slate-600">{inv.doctorName}</td>
                              <td><span className="badge badge-info">{inv.paymentMethod}</span></td>
                              <td className="font-black text-slate-900 text-xs">{formatINR(inv.total)}</td>
                              <td>
                                <span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                                  {inv.paymentStatus}
                                </span>
                              </td>
                              <td className="text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => setInvoiceForPrint(inv)}
                                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => { setInvoiceForPrint(inv); setTimeout(() => handlePrint('a4'), 80); }}
                                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-black text-white rounded font-semibold"
                                >
                                  🖨️ Print
                                </button>
                                <button
                                  onClick={() => handleSavePDF(inv)}
                                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-sm"
                                >
                                  📥 Save PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* STAFF SUB-VIEW 3: DUE PAYMENTS (KHATA) */}
                {staffTab === 'customers' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Customer Due Payments & Khata Ledger</h3>
                        <p className="text-xs text-slate-500">Collect due payments from patients and update account balances.</p>
                      </div>
                      <button
                        onClick={() => setKhataOnlyDue(!khataOnlyDue)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${khataOnlyDue ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        ⚠️ Pending Dues Only ({dueAccountsCount})
                      </button>
                    </div>

                    <div className="react-card overflow-hidden">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Total Purchases</th>
                            <th>Khata Balance Due</th>
                            <th className="text-right">Collection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredKhataCustomers.map((c, idx) => (
                            <tr key={c.id}>
                              <td className="text-slate-400 font-medium text-xs">{idx + 1}</td>
                              <td className="font-bold text-xs">{c.name}</td>
                              <td className="text-xs font-mono">{c.phone}</td>
                              <td className="text-xs text-slate-600">{c.address}</td>
                              <td className="font-bold text-xs">{formatINR(c.totalPurchases)}</td>
                              <td>
                                {c.khataBalance > 0 ? (
                                  <span className="badge badge-danger font-black text-xs">
                                    Due: {formatINR(c.khataBalance)}
                                  </span>
                                ) : (
                                  <span className="badge badge-success text-xs">Clear (₹0)</span>
                                )}
                              </td>
                              <td className="text-right">
                                {c.khataBalance > 0 ? (
                                  <button
                                    onClick={() => settleKhata(c)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                                  >
                                    💳 Settle / Collect Due
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">Paid In Full</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* STAFF SUB-VIEW 4: STOCK & INVENTORY (Cost Price Hidden from Worker) */}
                {staffTab === 'inventory' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Medicine Stock & Shelf Locations</h3>
                    <div className="react-card overflow-hidden">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Medicine Description</th>
                            <th>Category</th>
                            <th>Batch No</th>
                            <th>Rack / Shelf</th>
                            <th>Expiry</th>
                            <th>Retail Price</th>
                            <th>Stock</th>
                            <th className="text-right">Restock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicines.map(med => (
                            <tr key={med.id}>
                              <td>
                                <div className="font-bold text-xs">{med.name}</div>
                                <div className="text-[10px] text-slate-400">{med.generic} • {med.brand}</div>
                              </td>
                              <td><span className="badge badge-info">{med.category}</span></td>
                              <td className="font-mono text-xs text-slate-700">{med.batchNo}</td>
                              <td className="text-xs font-semibold text-slate-700">{med.rack}</td>
                              <td className="text-xs font-mono">{med.expiryDate}</td>
                              <td className="font-bold text-xs">{formatINR(med.price)}</td>
                              <td>
                                <span className={`badge ${med.stock <= 0 ? 'badge-danger' : med.stock < med.minStock ? 'badge-warning' : 'badge-success'}`}>
                                  {med.stock} units
                                </span>
                              </td>
                              <td className="text-right">
                                <button
                                  onClick={() => quickRestock(med.id, 20)}
                                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                                >
                                  +20
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* STAFF SUB-VIEW 5: PRESCRIPTIONS & ONLINE ORDERS */}
                {staffTab === 'prescriptions' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Incoming Customer Online Orders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerOrders.map(order => (
                        <div key={order.id} className="react-card p-4 space-y-3 border-l-4 border-blue-600">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
                              <div className="text-xs text-slate-500 font-mono">Ph: {order.customerPhone} • {order.date}</div>
                            </div>
                            <span className="badge badge-info">{order.status}</span>
                          </div>
                          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p><b>Address:</b> {order.deliveryAddress}</p>
                            <p><b>Total:</b> {formatINR(order.total)} • <b>Mode:</b> {order.paymentMethod}</p>
                          </div>
                          <button
                            onClick={() => convertOrderToPOSBill(order)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                          >
                            ⚡ Convert to POS Bill & Dispense
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ######################################################
            PORTAL 3: ADMIN PORTAL
            Master Control: ONLY ADMIN CAN REGISTER STAFF AND GIVE ID/PASSWORD!
            Master POS, Daily Sales, Khata Dues, Inventory with Cost Prices,
            Distributors, and Financial Reports.
            ###################################################### */}
        {activePortal === 'admin' && (
          <div className="space-y-6">
            {!adminUser ? (
              /* Dedicated Admin Login Screen */
              <div className="max-w-md mx-auto react-card p-6 sm:p-8 space-y-5 border-t-4 border-emerald-600 shadow-2xl">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 text-3xl flex items-center justify-center mx-auto shadow-inner">
                    🛡️
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Admin Portal Sign In</h3>
                  <p className="text-xs text-slate-500">
                    Restricted Access for Store Owner & Lead Pharmacist <b>{STORE_CONFIG.pharmacist}</b>.
                  </p>
                </div>

                {adminLoginError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {adminLoginError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin ID / Mobile *</label>
                    <input
                      type="text"
                      required
                      value={adminLoginId}
                      onChange={(e) => setAdminLoginId(e.target.value)}
                      placeholder="Admin ID or mobile number"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Confidential Password *</label>
                    <div className="relative">
                      <input
                        type={showAdminPwd ? 'text' : 'password'}
                        required
                        value={adminLoginPwd}
                        onChange={(e) => setAdminLoginPwd(e.target.value)}
                        placeholder="Enter master password"
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPwd(!showAdminPwd)}
                        className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        {showAdminPwd ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Unlock Admin Master Control
                  </button>
                </form>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                  No default administrator account is included. Configure secure server-side authentication before using admin features.
                </div>
              </div>
            ) : (
              /* Admin Authenticated Master Dashboard */
              <div className="space-y-6">
                {/* Admin Header Bar */}
                <div className="flex flex-wrap justify-between items-center gap-3 bg-emerald-900 text-white p-4 rounded-2xl shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">🛡️</span>
                    <div>
                      <div className="text-sm font-extrabold flex items-center gap-2">
                        <span>Admin Master Portal: {adminUser.name}</span>
                        <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">Store Owner</span>
                      </div>
                      <div className="text-xs text-emerald-300">Registered Pharmacist ({adminUser.qualification}) • Mobile: {adminUser.mobile}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAdminLogout}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
                    >
                      Logout Admin
                    </button>
                  </div>
                </div>

                {/* Admin Master Sub-Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-2">
                  {/* TAB 1: ONLY ADMIN CAN REGISTER STAFF AND ISSUE ID/PASSWORD */}
                  <button
                    onClick={() => setAdminTab('staff-register')}
                    className={`nav-tab-btn ${adminTab === 'staff-register' ? 'active bg-emerald-50 border-emerald-300 font-bold' : ''}`}
                  >
                    <span>🛡️ Register Staff & Passwords</span>
                    <span className="badge badge-success text-[10px]">Admin Only</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('pos')}
                    className={`nav-tab-btn ${adminTab === 'pos' ? 'active' : ''}`}
                  >
                    <span>🛒 Master POS Billing</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('invoices')}
                    className={`nav-tab-btn ${adminTab === 'invoices' ? 'active' : ''}`}
                  >
                    <span>📊 Daily Sales Bills ({todayInvoices.length})</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('customers')}
                    className={`nav-tab-btn ${adminTab === 'customers' ? 'active' : ''}`}
                  >
                    <span>💳 Due Payments (Khata)</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('inventory')}
                    className={`nav-tab-btn ${adminTab === 'inventory' ? 'active' : ''}`}
                  >
                    <span>📦 Inventory & Cost Prices</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('distributors')}
                    className={`nav-tab-btn ${adminTab === 'distributors' ? 'active' : ''}`}
                  >
                    <span>🚚 Distributors</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('reports')}
                    className={`nav-tab-btn ${adminTab === 'reports' ? 'active' : ''}`}
                  >
                    <span>📈 Profit & Financial Reports</span>
                  </button>
                </div>

                {/* ADMIN SUB-VIEW 1: STAFF REGISTRATION & ID/PASSWORD ISSUER (The Core Requirement) */}
                {adminTab === 'staff-register' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Left: Staff Registration Form */}
                      <div className="md:col-span-7 react-card p-6 sm:p-8 space-y-5 border-l-4 border-emerald-600">
                        <div>
                          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                            <span>Register New Staff & Issue ID/Password</span>
                            <span className="badge badge-success text-[10px]">Authorized Administrator</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Only a registered administrator can create staff accounts and issue login credentials.
                          </p>
                        </div>

                        {issuedCredentials ? (
                          /* Issued Credentials Confirmation Card */
                          <div className="space-y-4">
                            <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs space-y-3">
                              <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                                <span>✅ Staff Registered & Credentials Issued!</span>
                              </div>
                              <p className="text-slate-600">
                                Give these official credentials to the staff member so they can log into the <b>Staff Portal</b>:
                              </p>
                              <div className="p-4 bg-white rounded-xl border border-emerald-200 font-mono text-xs space-y-1.5 shadow-sm">
                                <p><b>Staff Full Name:</b> {issuedCredentials.name}</p>
                                <p><b>Staff ID (Username):</b> <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">{issuedCredentials.username}</span></p>
                                <p><b>Assigned Password:</b> <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">{issuedCredentials.password}</span></p>
                                <p><b>Assigned Role:</b> <span className="font-bold text-blue-700">{issuedCredentials.role}</span></p>
                                <p><b>Contact Mobile:</b> {issuedCredentials.mobile}</p>
                                <p className="text-[10px] text-slate-400 pt-1">Authorized By: {adminUser.name} • {STORE_CONFIG.storeName}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const text = `${STORE_CONFIG.storeName} - Staff Login Credentials:\nStaff ID: ${issuedCredentials.username}\nPassword: ${issuedCredentials.password}\nRole: ${issuedCredentials.role}\nLead Pharmacist: ${STORE_CONFIG.pharmacist}\nPortal URL: http://localhost:3000`;
                                  navigator.clipboard?.writeText(text);
                                  showToast('Credentials copied to clipboard!');
                                }}
                                className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                              >
                                <span>📋 Copy Credentials</span>
                              </button>
                              <button
                                onClick={() => setIssuedCredentials(null)}
                                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                              >
                                + Register Another Staff
                              </button>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleAdminRegisterStaff} className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Member Full Name *</label>
                              <input
                                name="name"
                                required
                                placeholder="e.g. Pooja Sharma or Amit Verma"
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Staff ID *</label>
                                <input
                                  name="username"
                                  required
                                  placeholder="e.g. pooja01 or worker2"
                                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Role *</label>
                                <select
                                  name="role"
                                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold"
                                >
                                  <option value="Worker">Worker (Billing Staff)</option>
                                  <option value="Admin">Admin (Co-Pharmacist)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Initial Staff Password *</label>
                              <input
                                name="password"
                                required
                                placeholder="Set password for this staff member"
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Mobile Number *</label>
                                <input
                                  type="tel"
                                  name="mobile"
                                  required
                                  placeholder="10-digit mobile"
                                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification / Designation</label>
                                <input
                                  name="qualification"
                                  placeholder="e.g. D.Pharm / Counter Operator"
                                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                            >
                              🛡️ Register Staff & Issue ID & Password
                            </button>
                          </form>
                        )}
                      </div>

                      {/* Right: Registered Staff Directory */}
                      <div className="md:col-span-5 react-card p-6 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <h4 className="font-bold text-sm text-slate-900">Registered Staff Directory</h4>
                          <span className="badge badge-info">{users.length} Active Accounts</span>
                        </div>

                        <div className="space-y-3">
                          {users.map(u => (
                            <div key={u.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${u.role === 'Admin' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                                    {u.role}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  Staff ID: <b>{u.username}</b> • Ph: {u.mobile}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <span>Password:</span>
                                  <span className="font-mono font-bold text-slate-700">
                                    {revealedPasswords[u.id] ? u.password : '••••••'}
                                  </span>
                                  <button 
                                    onClick={() => togglePasswordVisibility(u.id)}
                                    className="text-[9px] text-emerald-600 hover:underline ml-1"
                                  >
                                    {revealedPasswords[u.id] ? 'Hide' : 'View'}
                                  </button>
                                </div>
                              </div>

                              {u.id !== 'USR-001' && (
                                <button
                                  onClick={() => handleDeleteStaff(u.id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold p-1"
                                  title="Revoke staff account"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADMIN SUB-VIEW 2: POS BILLING */}
                {adminTab === 'pos' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Master POS Billing Terminal (Admin Session)</h3>
                    </div>
                    {/* Reuse POS billing controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-8 space-y-4">
                        <div className="react-card p-4 space-y-3">
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={posSearch}
                            onChange={(e) => handlePOSSearch(e.target.value)}
                            placeholder="Search medicine brand, composition, or scan barcode..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-medium"
                          />
                          {posSearchResults.length > 0 && (
                            <div className="absolute bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100">
                              {posSearchResults.map(med => (
                                <div key={med.id} onClick={() => addMedicineToPOSBill(med)} className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between">
                                  <div>
                                    <div className="font-bold text-xs">{med.name} ({med.batchNo})</div>
                                    <div className="text-[11px] text-slate-500">{med.generic} • Cost: {formatINR(med.costPrice)}</div>
                                  </div>
                                  <div className="font-bold text-emerald-700 text-xs">{formatINR(med.price)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="react-card overflow-hidden">
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Medicine</th>
                                <th>Batch</th>
                                <th>Price</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right">Total</th>
                                <th className="text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {posBillItems.map((item, idx) => (
                                <tr key={item.id}>
                                  <td className="font-bold text-xs">{item.name}</td>
                                  <td className="font-mono text-xs">{item.batchNo}</td>
                                  <td className="text-xs">{formatINR(item.price)}</td>
                                  <td className="text-center">{item.qty}</td>
                                  <td className="text-right font-bold text-xs">{formatINR(item.qty * item.price)}</td>
                                  <td className="text-right">
                                    <button onClick={() => updatePOSItemQty(idx, -item.qty)} className="text-red-500 font-bold">✕</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="lg:col-span-4 react-card p-6 space-y-3">
                        <h4 className="font-bold text-sm">Bill Checkout</h4>
                        <input type="tel" value={posCustomerPhone} onChange={(e) => handlePhoneLookup(e.target.value)} placeholder="Customer Phone" className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                        <input type="text" value={posCustomerName} onChange={(e) => setPosCustomerName(e.target.value)} placeholder="Customer Name" className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                        <select value={posPaymentMethod} onChange={(e) => setPosPaymentMethod(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white font-bold">
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="Credit (Khata)">Credit (Khata)</option>
                        </select>
                        <div className="border-t pt-2 flex justify-between font-black text-sm">
                          <span>Grand Total:</span>
                          <span className="text-emerald-700">{formatINR(posGrandTotal)}</span>
                        </div>
                        <button onClick={handlePOSCheckout} disabled={posBillItems.length === 0} className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">
                          Pay & Generate Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADMIN SUB-VIEW 3: DAILY SALES BILLS */}
                {adminTab === 'invoices' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">All Sales Invoices & Daily Revenue</h3>
                    <div className="react-card overflow-hidden">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Invoice ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Doctor</th>
                            <th>Billed By</th>
                            <th>Payment</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th className="text-right">Print & PDF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvoices.map(inv => (
                            <tr key={inv.id}>
                              <td className="font-mono text-xs font-bold text-emerald-800">{inv.id}</td>
                              <td className="text-xs text-slate-500">{inv.date}</td>
                              <td className="font-bold text-xs">{inv.customerName}</td>
                              <td className="text-xs">{inv.doctorName}</td>
                              <td className="text-xs">{inv.billedBy}</td>
                              <td><span className="badge badge-info">{inv.paymentMethod}</span></td>
                              <td className="font-black text-xs">{formatINR(inv.total)}</td>
                              <td><span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}>{inv.paymentStatus}</span></td>
                              <td className="text-right space-x-1">
                                <button onClick={() => setInvoiceForPrint(inv)} className="px-2 py-1 text-xs bg-slate-100 rounded">View</button>
                                <button onClick={() => { setInvoiceForPrint(inv); setTimeout(() => handlePrint('a4'), 80); }} className="px-2 py-1 text-xs bg-slate-800 text-white rounded">🖨️ Print</button>
                                <button onClick={() => handleSavePDF(inv)} className="px-2 py-1 text-xs bg-emerald-600 text-white rounded font-bold">📥 PDF</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN SUB-VIEW 4: DUE PAYMENTS (KHATA) */}
                {adminTab === 'customers' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Customer Khata Ledger (Total Market Due: {formatINR(totalOutstandingDue)})</h3>
                    <div className="react-card overflow-hidden">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Purchases</th>
                            <th>Due Balance</th>
                            <th className="text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredKhataCustomers.map(c => (
                            <tr key={c.id}>
                              <td className="font-bold text-xs">{c.name}</td>
                              <td className="text-xs font-mono">{c.phone}</td>
                              <td className="text-xs">{c.address}</td>
                              <td className="font-bold text-xs">{formatINR(c.totalPurchases)}</td>
                              <td>
                                {c.khataBalance > 0 ? (
                                  <span className="badge badge-danger">Due: {formatINR(c.khataBalance)}</span>
                                ) : (
                                  <span className="badge badge-success">Clear</span>
                                )}
                              </td>
                              <td className="text-right">
                                {c.khataBalance > 0 && (
                                  <button onClick={() => settleKhata(c)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                                    Settle Due
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN SUB-VIEW 5: INVENTORY & COST PRICES */}
                {adminTab === 'inventory' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-900">Stock & Batch Valuation (Cost Price Visible to Admin)</h3>
                      <button onClick={() => { setEditingMed(null); setIsAddMedOpen(true); }} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                        + Add New Medicine
                      </button>
                    </div>

                    <div className="react-card overflow-hidden">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Batch</th>
                            <th>Rack</th>
                            <th>Expiry</th>
                            <th>Cost Price (Admin)</th>
                            <th>Retail Price</th>
                            <th>Margin</th>
                            <th>Stock</th>
                            <th className="text-right">Edit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicines.map(med => (
                            <tr key={med.id}>
                              <td className="font-bold text-xs">{med.name}</td>
                              <td className="font-mono text-xs">{med.batchNo}</td>
                              <td className="text-xs">{med.rack}</td>
                              <td className="text-xs font-mono">{med.expiryDate}</td>
                              <td className="font-mono text-xs text-slate-600">{formatINR(med.costPrice)}</td>
                              <td className="font-bold text-xs">{formatINR(med.price)}</td>
                              <td className="text-xs text-emerald-700 font-bold">
                                {formatINR(med.price - med.costPrice)} ({Math.round(((med.price - med.costPrice) / med.price) * 100)}%)
                              </td>
                              <td><span className="badge badge-success">{med.stock}</span></td>
                              <td className="text-right">
                                <button onClick={() => { setEditingMed(med); setIsAddMedOpen(true); }} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-800 rounded font-semibold">
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN SUB-VIEW 6: DISTRIBUTORS */}
                {adminTab === 'distributors' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Wholesale Distributors & Suppliers</h3>
                    <div className="react-card overflow-hidden">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Distributor</th>
                            <th>Contact</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>Drug License</th>
                          </tr>
                        </thead>
                        <tbody>
                          {distributors.map(dist => (
                            <tr key={dist.id}>
                              <td className="font-bold text-xs">{dist.name}</td>
                              <td className="text-xs">{dist.contact}</td>
                              <td className="text-xs font-mono">{dist.phone}</td>
                              <td className="text-xs">{dist.city}</td>
                              <td className="font-mono text-xs">{dist.dlNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN SUB-VIEW 7: FINANCIAL REPORTS */}
                {adminTab === 'reports' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Financial Revenue & P&L Analytics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="react-card p-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">Gross Sales Revenue</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {formatINR(invoices.reduce((s, i) => s + i.total, 0))}
                        </div>
                      </div>
                      <div className="react-card p-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Inventory Value (MRP)</span>
                        <div className="text-2xl font-black text-emerald-800 mt-1">
                          {formatINR(medicines.reduce((s, m) => s + (m.stock * m.price), 0))}
                        </div>
                      </div>
                      <div className="react-card p-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">Outstanding Khata Dues</span>
                        <div className="text-2xl font-black text-red-700 mt-1">
                          {formatINR(totalOutstandingDue)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ========================================================
          TAX INVOICE MODAL WITH PRINT & SAVE IN PDF (html2pdf.js)
          ======================================================== */}
      {invoiceForPrint && (
        <div className="modal-overlay" onClick={() => setInvoiceForPrint(null)}>
          <div className="modal-content max-w-2xl p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-2">
              <span className="font-bold text-sm">Tax Invoice: {invoiceForPrint.id}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSavePDF(invoiceForPrint)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  📥 Save as PDF
                </button>
                <button
                  onClick={() => handlePrint('thermal')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Thermal (80mm)
                </button>
                <button
                  onClick={() => handlePrint('a4')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Print A4
                </button>
                <button
                  onClick={() => setInvoiceForPrint(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            <div id="pdf-invoice-modal-sheet" className="p-6 bg-white space-y-4 text-xs text-slate-800">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-black text-slate-900 uppercase">{STORE_CONFIG.storeName}</h2>
                <p className="text-slate-600 font-medium">{STORE_CONFIG.tagline}</p>
                {(STORE_CONFIG.address || STORE_CONFIG.city) && <p className="text-slate-600 mt-1">{[STORE_CONFIG.address, STORE_CONFIG.city].filter(Boolean).join(', ')}</p>}
                {STORE_CONFIG.phone && <p className="text-slate-700 font-semibold">Ph: {STORE_CONFIG.phone}</p>}
                {(STORE_CONFIG.dlNumber || STORE_CONFIG.gstin) && (
                  <div className="flex justify-center gap-4 text-[11px] text-slate-700 mt-2 font-mono bg-slate-50 py-1.5 rounded border">
                    {STORE_CONFIG.dlNumber && <span><b>D.L. No:</b> {STORE_CONFIG.dlNumber}</span>}
                    {STORE_CONFIG.gstin && <span><b>GSTIN:</b> {STORE_CONFIG.gstin}</span>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <p><span className="text-slate-400">Invoice:</span> <b className="text-slate-900 font-mono">{invoiceForPrint.id}</b></p>
                  <p><span className="text-slate-400">Date:</span> <b>{invoiceForPrint.date}</b></p>
                  <p><span className="text-slate-400">Doctor:</span> <b>{invoiceForPrint.doctorName || 'Self / OTC'}</b></p>
                </div>
                <div className="text-right">
                  <p><span className="text-slate-400">Patient:</span> <b>{invoiceForPrint.customerName}</b></p>
                  <p><span className="text-slate-400">Phone:</span> <b className="font-mono">{invoiceForPrint.customerPhone}</b></p>
                  <p><span className="text-slate-400">Billed by:</span> <b>{invoiceForPrint.billedBy}</b></p>
                  <p><span className="text-slate-400">Payment:</span> <b className="text-emerald-700">{invoiceForPrint.paymentMethod}</b> ({invoiceForPrint.paymentStatus})</p>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-700 font-bold bg-slate-50 text-left">
                    <th className="py-1.5 px-2">#</th>
                    <th className="py-1.5 px-2">Medicine Description</th>
                    <th className="py-1.5 px-2">Batch</th>
                    <th className="py-1.5 px-2 text-center">Qty</th>
                    <th className="py-1.5 px-2 text-right">Rate</th>
                    <th className="py-1.5 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceForPrint.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1 px-2 text-slate-400">{i + 1}</td>
                      <td className="py-1 px-2 font-bold text-slate-800">{item.name}</td>
                      <td className="py-1 px-2 font-mono text-[10px] text-slate-500">{item.batchNo}</td>
                      <td className="py-1 px-2 text-center font-bold">{item.qty}</td>
                      <td className="py-1 px-2 text-right">{formatINR(item.price)}</td>
                      <td className="py-1 px-2 text-right font-black text-slate-900">{formatINR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-end border-t pt-3">
                <div className="text-[11px] text-slate-500 max-w-xs space-y-1">
                  <p>Registered Pharmacist: <b>{STORE_CONFIG.pharmacist}</b></p>
                  <p className="text-[10px] text-slate-400 italic">* Medicines once sold returnable within 7 days in original seal.</p>
                </div>
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatINR(invoiceForPrint.subtotal)}</span>
                  </div>
                  {invoiceForPrint.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span>-{formatINR(invoiceForPrint.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-b py-1.5 font-black text-sm text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700">{formatINR(invoiceForPrint.total)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center text-[11px] text-slate-500 border-t border-dashed">
                <div>
                  {STORE_CONFIG.upiId && <p>Instant UPI ID: <b className="text-slate-900 font-mono">{STORE_CONFIG.upiId}</b></p>}
                </div>
                <div className="text-right">
                  <div className="w-32 border-b border-slate-400 mb-1 ml-auto"></div>
                  <p className="font-bold text-slate-800">Authorized Pharmacist</p>
                  <p className="text-[10px]">{STORE_CONFIG.pharmacist}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden container for Physical Print Dialog */}
      <div id="printable-invoice">
        {invoiceForPrint && (
          <div className="p-8">
            <div className="text-center pb-4 border-b">
              <h2 className="text-2xl font-black">{STORE_CONFIG.storeName}</h2>
              <p>{STORE_CONFIG.tagline}</p>
              {[STORE_CONFIG.address, STORE_CONFIG.city, STORE_CONFIG.phone].filter(Boolean).length > 0 && <p>{[STORE_CONFIG.address, STORE_CONFIG.city, STORE_CONFIG.phone].filter(Boolean).join(' | ')}</p>}
              {[STORE_CONFIG.dlNumber, STORE_CONFIG.gstin].filter(Boolean).length > 0 && <p>{[STORE_CONFIG.dlNumber && `D.L. No: ${STORE_CONFIG.dlNumber}`, STORE_CONFIG.gstin && `GSTIN: ${STORE_CONFIG.gstin}`].filter(Boolean).join(' | ')}</p>}
            </div>
            <div className="py-4 flex justify-between">
              <div>
                <p>Invoice: <b>{invoiceForPrint.id}</b></p>
                <p>Date: {invoiceForPrint.date}</p>
                <p>Doctor: {invoiceForPrint.doctorName}</p>
              </div>
              <div className="text-right">
                <p>Patient: <b>{invoiceForPrint.customerName}</b></p>
                <p>Phone: {invoiceForPrint.customerPhone}</p>
                <p>Billed By: {invoiceForPrint.billedBy}</p>
              </div>
            </div>
            <table className="w-full my-4 border-t border-b">
              <thead>
                <tr className="text-left font-bold border-b">
                  <th className="py-2">Item</th>
                  <th>Batch</th>
                  <th>Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceForPrint.items.map((it, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-1">{it.name}</td>
                    <td className="font-mono">{it.batchNo}</td>
                    <td>{it.qty}</td>
                    <td className="text-right">{formatINR(it.price)}</td>
                    <td className="text-right font-bold">{formatINR(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-end pt-4">
              <div>
                <p>Pharmacist: <b>{STORE_CONFIG.pharmacist}</b></p>
                {STORE_CONFIG.upiId && <p>UPI ID: {STORE_CONFIG.upiId}</p>}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">Total: {formatINR(invoiceForPrint.total)}</p>
                <div className="w-32 border-b border-black mt-8 mb-1 ml-auto"></div>
                <p>Authorized Signature</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          CUSTOMER CART & CHECKOUT DRAWER
          ======================================================== */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="modal-content max-w-md ml-auto h-full max-h-none rounded-none rounded-l-3xl p-6 flex flex-col justify-between overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>Customer Cart & Ordering</span>
                  <span className="badge badge-info">{storeCart.length} items</span>
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
              </div>

              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto my-3 pr-1">
                {storeCart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Your cart is empty.
                  </div>
                ) : (
                  storeCart.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border">
                        <img src={getMedImage(item)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{formatINR(item.price)} each</div>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs">-</button>
                          <span className="text-xs font-bold text-slate-800">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 rounded border flex items-center justify-center font-bold text-xs">+</button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-700 text-xs">{formatINR(item.qty * item.price)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {storeCart.length > 0 && (
                <div className="space-y-3 pt-3 border-t text-xs">
                  <h4 className="font-bold text-slate-800 text-xs">Delivery Details:</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Full Name *</label>
                    <input type="text" required value={orderCustomerName} onChange={(e) => setOrderCustomerName(e.target.value)} placeholder="Full Name" className="w-full px-3 py-1.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Mobile Number *</label>
                    <input type="tel" required value={orderCustomerPhone} onChange={(e) => setOrderCustomerPhone(e.target.value)} placeholder="10-digit mobile" className="w-full px-3 py-1.5 border rounded-xl font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Delivery Address *</label>
                    <textarea rows="2" required value={orderAddress} onChange={(e) => setOrderAddress(e.target.value)} placeholder="Street, Area, City" className="w-full px-3 py-1.5 border rounded-xl"></textarea>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select value={orderPaymentMode} onChange={(e) => setOrderPaymentMode(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl bg-white font-bold">
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                      {STORE_CONFIG.upiId && <option value="UPI">UPI</option>}
                      <option value="Store Pickup">Store Pickup</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {storeCart.length > 0 && (
              <div className="pt-4 border-t space-y-2 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total Payable:</span>
                  <span className="text-xl font-black text-slate-900">{formatINR(cartTotal)}</span>
                </div>
                <button onClick={handleCustomerPlaceOrder} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition">
                  Place Medicine Order
                </button>
                {STORE_CONFIG.phone && <button onClick={() => sendWhatsAppOrder()} className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl transition">
                  📱 Quick Order via WhatsApp
                </button>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CUSTOMER ORDER PLACED
          ======================================================== */}
      {isOrderSuccessOpen && lastPlacedOrder && (
        <div className="modal-overlay" onClick={() => setIsOrderSuccessOpen(false)}>
          <div className="modal-content max-w-md p-6 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 text-2xl rounded-full flex items-center justify-center mx-auto">
              ✓
            </div>
            <h3 className="text-xl font-black text-slate-900">Order Confirmed!</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Order ID: <b className="font-mono text-emerald-800">{lastPlacedOrder.id}</b></p>
              <p>Thank you, <b>{lastPlacedOrder.customerName}</b>! Lead Pharmacist <b>{STORE_CONFIG.pharmacist}</b> is preparing your order for express dispatch.</p>
              <p className="font-bold text-slate-900 mt-2">Total Amount: {formatINR(lastPlacedOrder.total)}</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              {STORE_CONFIG.phone && <button onClick={() => sendWhatsAppOrder(lastPlacedOrder)} className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                📱 Confirm via WhatsApp
              </button>}
              <button onClick={() => setIsOrderSuccessOpen(false)} className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MEDICINE QUICK VIEW
          ======================================================== */}
      {quickViewMed && (
        <div className="modal-overlay" onClick={() => setQuickViewMed(null)}>
          <div className="modal-content max-w-2xl p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-full bg-slate-100 relative overflow-hidden">
                <img src={getMedImage(quickViewMed)} alt={quickViewMed.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-emerald-800 font-bold uppercase">{quickViewMed.brand}</span>
                    <button onClick={() => setQuickViewMed(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">{quickViewMed.name}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{quickViewMed.generic}</p>
                  <div className="my-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border">
                    <p><b>Clinical Uses:</b> {quickViewMed.uses || 'Therapeutic medication'}</p>
                    <p><b>Dosage:</b> {quickViewMed.dosage || 'As directed by physician'}</p>
                    <p><b>Pack & Batch:</b> {quickViewMed.unit} • Batch: <span className="font-mono">{quickViewMed.batchNo}</span></p>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-emerald-700">{formatINR(quickViewMed.price)}</span>
                    <span className="text-xs text-slate-400 line-through">MRP {formatINR(quickViewMed.mrp)}</span>
                  </div>
                  <button onClick={() => { addToStoreCart(quickViewMed); setQuickViewMed(null); }} className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">
                    Add to Online Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT MEDICINE (Admin Only)
          ======================================================== */}
      {isAddMedOpen && adminUser && (
        <div className="modal-overlay" onClick={() => setIsAddMedOpen(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingMed ? `Edit Medicine: ${editingMed.name}` : 'Add New Medicine to Stock'}
              </h3>
              <button onClick={() => setIsAddMedOpen(false)} className="text-slate-400 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const name = fd.get('name');
              const generic = fd.get('generic');
              const brand = fd.get('brand');
              const category = fd.get('category');
              const batchNo = fd.get('batchNo');
              const rack = fd.get('rack');
              const mrp = parseFloat(fd.get('mrp')) || 0;
              const costPrice = parseFloat(fd.get('costPrice')) || 0;
              const price = parseFloat(fd.get('price')) || 0;
              const stock = parseInt(fd.get('stock')) || 0;
              const expiryDate = fd.get('expiryDate');
              const unit = fd.get('unit');
              const image = fd.get('image');

              if (editingMed) {
                setMedicines(prev => prev.map(m => m.id === editingMed.id ? {
                  ...m, name, generic, brand, category, batchNo, rack, mrp, costPrice, price, stock, expiryDate, unit, image
                } : m));
                showToast(`Updated ${name}`);
              } else {
                const newId = `MED-${String(medicines.length + 1).padStart(3, '0')}`;
                setMedicines(prev => [{
                  id: newId, name, generic, brand, category, batchNo, rack, mrp, costPrice, price, stock, minStock: 15, expiryDate, unit, image,
                  rating: 4.8, reviews: 10, uses: 'Therapeutic medication', dosage: 'As directed by physician'
                }, ...prev]);
                showToast(`Added ${name} to stock!`);
              }
              setIsAddMedOpen(false);
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand Name *</label>
                  <input name="name" required defaultValue={editingMed?.name} placeholder="e.g. Dolo 650" className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Generic Formula *</label>
                  <input name="generic" required defaultValue={editingMed?.generic} placeholder="e.g. Paracetamol (650mg)" className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Manufacturer</label>
                  <input name="brand" defaultValue={editingMed?.brand} placeholder="e.g. Micro Labs" className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select name="category" defaultValue={editingMed?.category || 'Pain & Fever'} className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Photo URL</label>
                <input name="image" defaultValue={editingMed?.image} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-1.5 text-xs border rounded-xl" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Batch No *</label>
                  <input name="batchNo" required defaultValue={editingMed?.batchNo} placeholder="Batch" className="w-full px-3 py-1.5 text-xs border rounded-xl font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Rack / Shelf</label>
                  <input name="rack" defaultValue={editingMed?.rack || 'Rack A-01'} className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date *</label>
                  <input type="date" name="expiryDate" required defaultValue={editingMed?.expiryDate} className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost Price (₹)</label>
                  <input type="number" step="0.01" name="costPrice" defaultValue={editingMed?.costPrice} className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Retail Rate (₹) *</label>
                  <input type="number" step="0.01" name="price" required defaultValue={editingMed?.price} className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">MRP (₹)</label>
                  <input type="number" step="0.01" name="mrp" defaultValue={editingMed?.mrp} className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Count *</label>
                  <input type="number" name="stock" required defaultValue={editingMed?.stock || 50} className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Packaging</label>
                  <input name="unit" defaultValue={editingMed?.unit || 'Strip of 10 Tabs'} className="w-full px-3 py-1.5 text-xs border rounded-xl" />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddMedOpen(false)} className="px-4 py-2 text-xs text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl">Save Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Alerts */}
      <div id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'toast-error' : t.type === 'warning' ? 'toast-warning' : ''}`}>
            <span className={`font-black text-base ${t.type === 'error' ? 'text-red-500' : t.type === 'warning' ? 'text-amber-500' : 'text-emerald-600'}`}>
              {t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 <b>Pal Medical Store</b>. Pharmacy management demo.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Lead Pharmacist: <b className="text-slate-700">{STORE_CONFIG.pharmacist}</b></span>
            <span>•</span>
            <span>Active Portal: <b className="text-slate-700 uppercase">{activePortal} Portal</b></span>
            <span>•</span>
            {STORE_CONFIG.phone && <span>Store contact: <b className="text-slate-700">{STORE_CONFIG.phone}</b></span>}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mount the React Application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
