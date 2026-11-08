Warning: truncated output (original token count: 35811)
Total output lines: 2750

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

    setCustomerOrders(prev => prev.map(o => …23811 tokens truncated… </tr>
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
