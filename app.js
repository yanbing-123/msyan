// ==================== 数据层 ====================

const Storage = {
    KEYS: {
        STATIONS: 'trainticket_stations',
        TRAINS: 'trainticket_trains',
        SCHEDULES: 'trainticket_schedules',
        SEATS: 'trainticket_seats',
        INVENTORY: 'trainticket_inventory',
        PASSENGERS: 'trainticket_passengers',
        ORDERS: 'trainticket_orders',
        SESSION: 'trainticket_session'
    },
    
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    // 初始化示例数据
    init() {
        // 车站
        if (this.get(this.KEYS.STATIONS).length === 0) {
            const stations = [
                { code: 'BJ', name: '北京南', city: '北京', pinyin: 'beijing' },
                { code: 'SH', name: '上海虹桥', city: '上海', pinyin: 'shanghai' },
                { code: 'GZ', name: '广州南', city: '广州', pinyin: 'guangzhou' },
                { code: 'SZ', name: '深圳北', city: '深圳', pinyin: 'shenzhen' },
                { code: 'CD', name: '成都东', city: '成都', pinyin: 'chengdu' },
                { code: 'CQ', name: '重庆北', city: '重庆', pinyin: 'chongqing' },
                { code: 'HZ', name: '杭州东', city: '杭州', pinyin: 'hangzhou' },
                { code: 'NJ', name: '南京南', city: '南京', pinyin: 'nanjing' },
                { code: 'WH', name: '武汉', city: '武汉', pinyin: 'wuhan' },
                { code: 'CS', name: '长沙南', city: '长沙', pinyin: 'changsha' }
            ];
            this.set(this.KEYS.STATIONS, stations);
        }
        
        // 车次
        if (this.get(this.KEYS.TRAINS).length === 0) {
            const trains = [
                { id: 'G1', number: 'G1', type: 'G', name: '京沪高速', from: 'BJ', to: 'SH', duration: '4:48' },
                { id: 'G2', number: 'G2', type: 'G', name: '沪京高速', from: 'SH', to: 'BJ', duration: '4:53' },
                { id: 'G3', number: 'G3', type: 'G', name: '京广高速', from: 'BJ', to: 'GZ', duration: '8:12' },
                { id: 'G4', number: 'G4', type: 'G', name: '广京高速', from: 'GZ', to: 'BJ', duration: '8:08' },
                { id: 'D301', number: 'D301', type: 'D', name: '京沪动车', from: 'BJ', to: 'SH', duration: '6:23' },
                { id: 'D302', number: 'D302', type: 'D', name: '沪京动车', from: 'SH', to: 'BJ', duration: '6:30' },
                { id: 'K101', number: 'K101', type: 'K', name: '京沪快速', from: 'BJ', to: 'SH', duration: '12:30' },
                { id: 'T101', number: 'T101', type: 'T', name: '京沪特快', from: 'BJ', to: 'SH', duration: '9:45' },
                { id: 'G43', number: 'G43', type: 'G', name: '京广高速', from: 'BJ', to: 'CS', duration: '4:07' },
                { id: 'G601', number: 'G601', type: 'G', name: '成渝高速', from: 'CD', to: 'CQ', duration: '1:10' }
            ];
            this.set(this.KEYS.TRAINS, trains);
        }
        
        // 排期
        if (this.get(this.KEYS.SCHEDULES).length === 0) {
            const schedules = [];
            const trains = this.get(this.KEYS.TRAINS);
            const dates = ['2026-03-27', '2026-03-28', '2026-03-29'];
            const times = ['07:00', '08:30', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
            const prices = { G: { second: 500, first: 800, business: 1500 }, D: { second: 350, first: 500, business: 1000 }, K: { second: 150, first: 0, business: 0 }, T: { second: 200, first: 0, business: 0 } };
            
            let id = 1;
            trains.forEach(train => {
                const basePrice = prices[train.type];
                dates.forEach(date => {
                    times.forEach(time => {
                        schedules.push({
                            id: String(id++),
                            trainId: train.id,
                            date,
                            departureTime: time,
                            arrivalTime: this.calculateArrivalTime(time, train.duration),
                            from: train.from,
                            to: train.to,
                            priceSecond: basePrice.second,
                            priceFirst: basePrice.first,
                            priceBusiness: basePrice.business,
                            totalSecond: 100,
                            totalFirst: 40,
                            totalBusiness: 20,
                            remainingSecond: 80,
                            remainingFirst: 30,
                            remainingBusiness: 15
                        });
                    });
                });
            });
            this.set(this.KEYS.SCHEDULES, schedules);
        }
        
        // 乘客
        if (this.get(this.KEYS.PASSENGERS).length === 0) {
            const passengers = [
                { id: '1', name: '张三', idNumber: '110101199001011234', phone: '13800138001' },
                { id: '2', name: '李四', idNumber: '310101198501015678', phone: '13800138002' }
            ];
            this.set(this.KEYS.PASSENGERS, passengers);
        }
    },
    
    calculateArrivalTime(departure, duration) {
        const [h, m] = departure.split(':').map(Number);
        const [dh, dm] = duration.split(':').map(Number);
        let arrivalH = h + dh;
        let arrivalM = m + dm;
        if (arrivalM >= 60) {
            arrivalH += 1;
            arrivalM -= 60;
        }
        return `${String(arrivalH).padStart(2, '0')}:${String(arrivalM).padStart(2, '0')}`;
    }
};

// ==================== 全局状态 ====================

let state = {
    currentSchedule: null,
    selectedSeats: [],
    selectedPassengers: [],
    passengers: []
};

// ==================== 工具函数 ====================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatPrice(price) {
    return '¥' + price.toFixed(0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${date.toLocaleDateString('zh-CN')} ${days[date.getDay()]}`;
}

function getStationByCode(code) {
    const stations = Storage.get(Storage.KEYS.STATIONS);
    const station = stations.find(s => s.code === code);
    return station ? station.name : code;
}

// ==================== 页面切换 ====================

function switchSection(section) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(section + '-section').classList.add('active');
    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) navItem.classList.add('active');
    
    if (section === 'query') renderQuery();
    if (section === 'orders') renderOrders();
    if (section === 'stations') renderStations();
}

// ==================== 车站管理 ====================

function renderStations() {
    const stations = Storage.get(Storage.KEYS.STATIONS);
    document.getElementById('station-list').innerHTML = `
        <div class="table-container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>代码</th>
                        <th>车站名称</th>
                        <th>所在城市</th>
                        <th>拼音</th>
                    </tr>
                </thead>
                <tbody>
                    ${stations.map(s => `
                        <tr>
                            <td><strong>${s.code}</strong></td>
                            <td>${s.name}</td>
                            <td>${s.city}</td>
                            <td>${s.pinyin}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ==================== 查询 ====================

function renderQuery() {
    const stations = Storage.get(Storage.KEYS.STATIONS);
    
    const fromSelect = document.getElementById('from-station');
    const toSelect = document.getElementById('to-station');
    
    // 清空并重新添加选项
    fromSelect.innerHTML = stations.map(s => `<option value="${s.code}">${s.name}</option>`).join('');
    toSelect.innerHTML = stations.map(s => `<option value="${s.code}">${s.name}</option>`).join('');
    
    // 设置默认值
    fromSelect.value = 'BJ';
    toSelect.value = 'SH';
    
    // 日期设置为今天
    document.getElementById('travel-date').valueAsDate = new Date();
}

function searchTrains() {
    const from = document.getElementById('from-station').value;
    const to = document.getElementById('to-station').value;
    const date = document.getElementById('travel-date').value;
    
    if (!date) {
        showToast('请选择出发日期', 'danger');
        return;
    }
    
    if (from === to) {
        showToast('出发站和到达站不能相同', 'danger');
        return;
    }
    
    const schedules = Storage.get(Storage.KEYS.SCHEDULES).filter(s => 
        s.from === from && 
        s.to === to && 
        s.date === date
    );
    
    const trainCount = document.getElementById('train-count');
    const trainList = document.getElementById('train-list');
    
    trainCount.textContent = schedules.length;
    
    if (schedules.length === 0) {
        trainList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">.navigateByUrl</div>
                <h5>暂无车次</h5>
                <p>请更换出发站或到达站</p>
            </div>
        `;
        return;
    }
    
    const trains = Storage.get(Storage.KEYS.TRAINS);
    trainList.innerHTML = schedules.map(s => {
        const train = trains.find(t => t.id === s.trainId);
        return `
            <div class="train-card" onclick="selectSchedule('${s.id}')">
                <div class="train-card-header">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <div class="train-time">${s.departureTime}</div>
                            <div class="text-muted">${getStationByCode(s.from)}</div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="text-muted mb-1">${train ? train.number : s.trainId} - ${train ? train.name : ''}</div>
                            <div class="train-duration">
                                <i class="bi bi-clock"></i> ${s.duration}
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="train-time">${s.arrivalTime}</div>
                            <div class="text-muted">${getStationByCode(s.to)}</div>
                        </div>
                    </div>
                </div>
                <div class="train-card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <div>${formatDate(s.date)}</div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="train-price">二等座 ¥${s.priceSecond}</div>
                        </div>
                        <div class="col-md-4 text-end">
                            <div>余票：二等 ${(s.remainingSecond / s.totalSecond * 100).toFixed(0)}% | 一等 ${(s.remainingFirst / s.totalFirst * 100).toFixed(0)}% | 商务 ${(s.remainingBusiness / s.totalBusiness * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectSchedule(scheduleId) {
    const schedule = Storage.get(Storage.KEYS.SCHEDULES).find(s => s.id === scheduleId);
    if (!schedule) return;
    
    state.currentSchedule = schedule;
    
    // 更新车站和站点信息
    document.getElementById('seat-train-name').textContent = `${schedule.id} - ${schedule.date}`;
    document.getElementById('seat-train-info').textContent = `${getStationByCode(schedule.from)} → ${getStationByCode(schedule.to)} | ${schedule.departureTime} 发车`;
    
    // 更新票价
    document.getElementById('seat-price-2nd').textContent = schedule.priceSecond;
    document.getElementById('seat-price-1st').textContent = schedule.priceFirst;
    document.getElementById('seat-price-bus').textContent = schedule.priceBusiness;
    
    // 渲染座位图
    renderSeatMap();
    
    // 更新订单信息
    updateOrderInfo();
    
    switchSection('seat');
    
    // 加载乘客
    loadPassengers();
}

// ==================== 座位管理 ====================

function renderSeatMap() {
    const schedule = state.currentSchedule;
    if (!schedule) return;
    
    const seatMap = document.getElementById('seat-map');
    seatMap.innerHTML = '';
    
    // 生成座位
    const rows = 8;
    const cols = ['A', 'B', 'C', 'D', 'F']; // 二等座
    const firstCols = ['A', 'C', 'D', 'F']; // 一等座
    const businessCols = ['A', 'C', 'F']; // 商务座
    
    // 二等座
    for (let row = 1; row <= rows; row++) {
        let rowHtml = `<div class="seat-row" data-row="${row}" data-class="second">`;
        for (let col of cols) {
            const seatCode = `${row}${col}`;
            const seatId = `${schedule.id}-${seatCode}`;
            
            // 模拟已售座位
            const isSold = (row * 10 + col.charCodeAt(0)) % 15 === 0;
            
            let className = 'seat available second';
            if (isSold) className = 'seat sold';
            if (state.selectedSeats.includes(seatId)) className = 'seat selected';
            
            rowHtml += `<div class="${className}" onclick="toggleSeat('${seatId}', '${schedule.priceSecond}', 'second')" data-id="${seatId}">${seatCode}</div>`;
        }
        rowHtml += '</div>';
        seatMap.innerHTML += rowHtml;
    }
    
    // 一等座
    for (let row = 1; row <= 4; row++) {
        let rowHtml = `<div class="seat-row" data-row="${row}" data-class="first">`;
        for (let col of firstCols) {
            const seatCode = `${row}${col}`;
            const seatId = `${schedule.id}-${seatCode}`;
            
            const isSold = (row * 8 + col.charCodeAt(0)) % 20 === 0;
            
            let className = 'seat available first';
            if (isSold) className = 'seat sold';
            if (state.selectedSeats.includes(seatId)) className = 'seat selected';
            
            rowHtml += `<div class="${className}" onclick="toggleSeat('${seatId}', '${schedule.priceFirst}', 'first')" data-id="${seatId}">${seatCode}</div>`;
        }
        rowHtml += '</div>';
        seatMap.innerHTML += rowHtml;
    }
    
    // 商务座
    for (let row = 1; row <= 2; row++) {
        let rowHtml = `<div class="seat-row" data-row="${row}" data-class="business">`;
        for (let col of businessCols) {
            const seatCode = `${row}${col}`;
            const seatId = `${schedule.id}-${seatCode}`;
            
            const isSold = (row * 6 + col.charCodeAt(0)) % 25 === 0;
            
            let className = 'seat available business';
            if (isSold) className = 'seat sold';
            if (state.selectedSeats.includes(seatId)) className = 'seat selected';
            
            rowHtml += `<div class="${className}" onclick="toggleSeat('${seatId}', '${schedule.priceBusiness}', 'business')" data-id="${seatId}">${seatCode}</div>`;
        }
        rowHtml += '</div>';
        seatMap.innerHTML += rowHtml;
    }
    
    updateSeatCount();
}

function toggleSeat(seatId, price, type) {
    const index = state.selectedSeats.indexOf(seatId);
    if (index > -1) {
        state.selectedSeats.splice(index, 1);
    } else {
        if (state.selectedSeats.length >= 4) {
            showToast('最多可选 4 张票', 'warning');
            return;
        }
        state.selectedSeats.push(seatId);
    }
    
    renderSeatMap();
    updateOrderInfo();
}

function filterSeats(type) {
    const rows = document.querySelectorAll('.seat-row');
    rows.forEach(row => {
        row.style.display = (type === 'all' || row.dataset.class === type) ? 'flex' : 'none';
    });
}

function updateSeatCount() {
    document.getElementById('selected-seat-count').textContent = state.selectedSeats.length;
}

// ==================== 乘客管理 ====================

function loadPassengers() {
    state.passengers = Storage.get(Storage.KEYS.PASSENGERS);
    renderPassengerList();
}

function renderPassengerList() {
    const container = document.getElementById('passenger-list');
    
    if (state.passengers.length === 0) {
        container.innerHTML = '<div class="text-muted text-center py-3">暂无乘客，请添加乘客</div>';
        return;
    }
    
    container.innerHTML = state.passengers.map(p => {
        const isSelected = state.selectedPassengers.includes(p.id);
        const avatarName = p.name[0];
        
        return `
            <div class="passenger-item ${isSelected ? 'selected' : ''}" onclick="togglePassenger('${p.id}')">
                <div class="passenger-avatar">${avatarName}</div>
                <div class="flex-grow-1">
                    <div class="fw-bold">${p.name}</div>
                    <div class="text-muted small">${p.idNumber}</div>
                </div>
                <div>
                    <i class="bi bi-person-circle ${isSelected ? 'text-primary' : 'text-muted'}"></i>
                </div>
            </div>
        `;
    }).join('');
}

function togglePassenger(passengerId) {
    const index = state.selectedPassengers.indexOf(passengerId);
    if (index > -1) {
        state.selectedPassengers.splice(index, 1);
    } else {
        if (state.selectedPassengers.length >= 4) {
            showToast('最多可选择 4 张票', 'warning');
            return;
        }
        state.selectedPassengers.push(passengerId);
    }
    
    renderPassengerList();
    updateOrderInfo();
}

function updateOrderInfo() {
    const schedule = state.currentSchedule;
    if (!schedule) return;
    
    const train = Storage.get(Storage.KEYS.TRAINS).find(t => t.id === schedule.trainId);
    
    document.getElementById('order-train').textContent = train ? `${train.number} - ${train.name}` : schedule.id;
    document.getElementById('order-from').textContent = `${getStationByCode(schedule.from)} (${schedule.departureTime})`;
    document.getElementById('order-to').textContent = `${getStationByCode(schedule.to)} (${schedule.arrivalTime})`;
    document.getElementById('order-time').textContent = formatDate(schedule.date);
    document.getElementById('order-seats').textContent = `${state.selectedSeats.length} 个`;
    document.getElementById('order-price').textContent = formatPrice(getTotalPrice());
    document.getElementById('order-total').textContent = formatPrice(getTotalPrice());
}

function getTotalPrice() {
    const schedule = state.currentSchedule;
    if (!schedule) return 0;
    
    let totalPrice = 0;
    state.selectedSeats.forEach(seatId => {
        const type = seatId.includes('-1') || seatId.includes('-2') || seatId.includes('-3') || seatId.includes('-4') ? 'first' : 'second';
        if (seatId.includes('business')) {
            totalPrice += schedule.priceBusiness;
        } else if (type === 'first') {
            totalPrice += schedule.priceFirst;
        } else {
            totalPrice += schedule.priceSecond;
        }
    });
    
    return totalPrice;
}

// ==================== 订单管理 ====================

function openConfirmModal() {
    const schedule = state.currentSchedule;
    if (!schedule) return;
    
    if (state.selectedSeats.length === 0) {
        showToast('请至少选择一个座位', 'danger');
        return;
    }
    
    if (state.selectedPassengers.length === 0) {
        showToast('请至少选择一位乘客', 'danger');
        return;
    }
    
    const train = Storage.get(Storage.KEYS.TRAINS).find(t => t.id === schedule.trainId);
    
    // 所有选中的乘客
    const passengers = state.passengers.filter(p => state.selectedPassengers.includes(p.id));
    
    document.getElementById('confirm-info').innerHTML = `
        <div class="alert alert-success">
            <h5><i class="bi bi-check-circle"></i> 订单确认</h5>
        </div>
        <p><strong>车次：</strong> ${train ? train.number : schedule.id}</p>
        <p><strong>日期：</strong> ${formatDate(schedule.date)}</p>
        <p><strong>时间：</strong> ${schedule.departureTime} - ${schedule.arrivalTime}</p>
        <p><strong>站点：</strong> ${getStationByCode(schedule.from)} → ${getStationByCode(schedule.to)}</p>
        <p><strong>座位：</strong> ${state.selectedSeats.join(', ')}</p>
        <p><strong>乘客：</strong> ${passengers.map(p => p.name).join(', ')}</p>
        <p class="text-danger fw-bold fs-4"><strong>应付金额：</strong> ${formatPrice(getTotalPrice())}</p>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('confirm-modal'));
    modal.show();
}

function payOrder() {
    const schedule = state.currentSchedule;
    if (!schedule) return;
    
    // 模拟支付成功
    const orderId = 'T' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.random().toString(36).substr(2, 4).toUpperCase();
    const ticketCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    const train = Storage.get(Storage.KEYS.TRAINS).find(t => t.id === schedule.trainId);
    const passengers = state.passengers.filter(p => state.selectedPassengers.includes(p.id));
    
    const order = {
        id: orderId,
        ticketCode,
        trainId: schedule.trainId,
        trainNumber: train ? train.number : schedule.id,
        date: schedule.date,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        from: schedule.from,
        to: schedule.to,
        seats: state.selectedSeats,
        passengers: state.selectedPassengers,
        totalPrice: getTotalPrice(),
        status: 'paid',
        createdAt: new Date().toISOString()
    };
    
    // 保存订单
    const orders = Storage.get(Storage.KEYS.ORDERS);
    orders.unshift(order);
    Storage.set(Storage.KEYS.ORDERS, orders);
    
    // 显示电子票
    showTicket(order);
    
    // 清空状态
    state.selectedSeats = [];
    state.selectedPassengers = [];
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirm-modal'));
    modal.hide();
}

function showTicket(order) {
    const train = Storage.get(Storage.KEYS.TRAINS).find(t => t.id === order.trainId);
    const passengers = state.passengers.filter(p => order.passengers.includes(p.id));
    
    document.getElementById('ticket-info').innerHTML = `
        <div class="alert alert-success text-center">
            <h4><i class="bi bi-credit-card"></i> 支付成功！</h4>
        </div>
        <div class="text-center mb-3">
            <p class="mb-1"><strong>订单号：</strong>${order.id}</p>
            <p class="mb-3"><strong>取票码：</strong><span class="text-primary">${order.ticketCode}</span></p>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="mb-2">车次信息</h6>
                <p class="mb-1"><strong>车次：</strong>${order.trainNumber}</p>
                <p class="mb-1"><strong>日期：</strong>${formatDate(order.date)}</p>
                <p class="mb-1"><strong>时间：</strong>${order.departureTime} - ${order.arrivalTime}</p>
                <p class="mb-1"><strong>站点：</strong>${getStationByCode(order.from)} → ${getStationByCode(order.to)}</p>
                <p class="mb-1"><strong>座位：</strong>${order.seats.join(', ')}</p>
            </div>
            <div class="col-md-6">
                <h6 class="mb-2">乘客信息</h6>
                ${passengers.map(p => `
                    <p class="mb-1"><strong>${p.name}</strong> - ${p.idNumber}</p>
                `).join('')}
                <p class="mb-1"><strong>总金额：</strong>${formatPrice(order.totalPrice)}</p>
            </div>
        </div>
        <div class="ticket-qr">
            <div class="mb-2">请凭取票码在自助取票机取票</div>
            <div class="ticket-code">${order.ticketCode}</div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('ticket-modal'));
    modal.show();
}

// ==================== 订单列表 ====================

function renderOrders() {
    const orders = Storage.get(Storage.KEYS.ORDERS);
    
    if (orders.length === 0) {
        document.getElementById('orders-list').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h5>暂无订单</h5>
                <p>快去查询车次购票吧</p>
                <button class="btn btn-primary mt-3" onclick="switchSection('query')">去查询</button>
            </div>
        `;
        return;
    }
    
    document.getElementById('orders-list').innerHTML = orders.map(o => {
        const train = Storage.get(Storage.KEYS.TRAINS).find(t => t.id === o.trainId);
        
        let statusClass = 'status-available';
        let statusText = '已支付';
        
        return `
            <div class="train-card" onclick="alert('订单详情：订单号 ${o.id}')">
                <div class="train-card-header">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="train-time">${o.departureTime}</div>
                            <div class="text-muted">${getStationByCode(o.from)}</div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="text-muted mb-1">${o.trainNumber}</div>
                            <div class="text-muted">乘客：${o.passengers.length}人</div>
                        </div>
                        <div class="col-md-5 text-end">
                            <div class="train-time">${o.arrivalTime}</div>
                            <div class="text-muted">${getStationByCode(o.to)}</div>
                        </div>
                    </div>
                </div>
                <div class="train-card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="text-muted mb-1">${formatDate(o.date)}</div>
                        </div>
                        <div class="col-md-3 text-center">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="col-md-3 text-end">
                            <div class="text-danger fw-bold">${formatPrice(o.totalPrice)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 其他功能 ====================

function goBackToDetail() {
    const order = state.currentSchedule;
    switchSection('query');
}

function clearSearch() {
    document.getElementById('travel-date').value = '';
    document.getElementById('train-count').textContent = '0';
    document.getElementById('train-list').innerHTML = '';
}

function openAddPassengerModal() {
    document.getElementById('passenger-name').value = '';
    document.getElementById('passenger-id').value = '';
    const modal = new bootstrap.Modal(document.getElementById('passenger-modal'));
    modal.show();
}

function addPassenger() {
    const name = document.getElementById('passenger-name').value.trim();
    const idNumber = document.getElementById('passenger-id').value.trim();
    
    if (!name || !idNumber) {
        showToast('请填写乘客信息', 'danger');
        return;
    }
    
    const passengers = Storage.get(Storage.KEYS.PASSENGERS);
    
    // 检查是否已存在
    const existing = passengers.find(p => p.idNumber === idNumber);
    if (existing) {
        showToast('该乘客已存在', 'danger');
        return;
    }
    
    const newPassenger = {
        id: Date.now().toString(),
        name,
        idNumber,
        phone: ''
    };
    
    passengers.push(newPassenger);
    Storage.set(Storage.KEYS.PASSENGERS, passengers);
    
    // 更新乘客列表
    loadPassengers();
    
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('passenger-modal'));
    modal.hide();
    
    showToast('乘客添加成功');
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    Storage.init();
    renderQuery();
    renderStations();
});
