// Event listings shown in the Burundi Events catalogue.
const events = [
  { id: 1, title: 'Bujumbura City Music Night', city: 'Bujumbura', venue: 'Place de l’Indépendance', date: '2026-11-14', category: 'Music', price: 12000, tickets: [{ name: 'General entry', price: 12000, detail: 'Standing area · Doors open at 18:00' }, { name: 'Reserved seat', price: 25000, detail: 'Reserved seating near the stage' }, { name: 'Student entry', price: 7000, detail: 'Student ID required at entry' }] },
  { id: 2, title: 'Gitega Heritage Week', city: 'Gitega', venue: 'National Museum Gardens', date: '2026-11-21', category: 'Culture', price: 5000, tickets: [{ name: 'Day pass', price: 5000, detail: 'Entry to the heritage exhibitions' }, { name: 'Guided tour', price: 10000, detail: 'Day pass plus a guided tour' }, { name: 'Family pass', price: 18000, detail: 'Entry for up to four family members' }] },
  { id: 3, title: 'Lake Tanganyika Run', city: 'Bujumbura', venue: 'Saga Beach', date: '2026-12-06', category: 'Sport', price: 8000, tickets: [{ name: '5 kilometre run', price: 8000, detail: '5 km route · Water station included' }, { name: '10 kilometre run', price: 12000, detail: '10 km route · Water stations included' }, { name: 'Supporter pass', price: 3000, detail: 'Access to the event and finish area' }] },
  { id: 4, title: 'Bururi Community Food Fair', city: 'Bururi', venue: 'Bururi Community Grounds', date: '2026-12-12', category: 'Community', price: 3000, tickets: [{ name: 'Entry ticket', price: 3000, detail: 'Entry to the community food fair' }, { name: 'Tasting ticket', price: 8000, detail: 'Entry plus a selection of local tastings' }] },
  { id: 5, title: 'Ngozi Creative Market', city: 'Ngozi', venue: 'Ngozi Cultural Centre', date: '2027-01-09', category: 'Community', price: 4000, tickets: [{ name: 'Market entry', price: 4000, detail: 'Entry to the local makers market' }, { name: 'Entry and workshop', price: 9000, detail: 'Entry plus one beginner craft workshop' }] },
  { id: 6, title: 'Gitega Acoustic Sessions', city: 'Gitega', venue: 'Indépendance Cultural Centre', date: '2027-01-23', category: 'Music', price: 10000, tickets: [{ name: 'General entry', price: 10000, detail: 'General admission · Doors open at 19:00' }, { name: 'Front seating', price: 18000, detail: 'Reserved seats close to the performers' }] }
];

function readSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function removeSavedData(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Continue if browser storage is unavailable.
  }
}

function formatPrice(price) {
  return price.toLocaleString('en-US') + ' BIF';
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, function(character) {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    if (character === '>') return '&gt;';
    if (character === '"') return '&quot;';
    return '&#39;';
  });
}

function formatDate(dateText) {
  const date = new Date(dateText + 'T12:00:00');
  return { day: date.getDate(), month: date.toLocaleDateString('en', { month: 'short' }).toUpperCase(), full: date.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' }) };
}

function getRemainingTickets(event, ticketIndex) {
  const ticket = event.tickets[ticketIndex];
  const capacity = Number.isInteger(ticket.available) ? ticket.available : 50;
  const bookings = readSavedData('burundiBookings', []);
  let sold = 0;
  bookings.forEach(function(booking) {
    const sameTicket = booking.ticketIndex === ticketIndex || (booking.ticketIndex === undefined && booking.ticket === ticket.name);
    if (booking.eventId === event.id && sameTicket) sold += booking.quantity || 1;
  });
  return Math.max(0, capacity - sold);
}

function getEventAvailability(event) {
  let total = 0;
  event.tickets.forEach(function(ticket, index) {
    total += getRemainingTickets(event, index);
  });
  return total;
}

function getEventLowestPrice(event) {
  let lowestPrice = event.tickets[0].price;
  event.tickets.forEach(function(ticket) {
    if (ticket.price < lowestPrice) lowestPrice = ticket.price;
  });
  return lowestPrice;
}

function showEvents() {
  const grid = document.getElementById('eventGrid');
  if (!grid) return;
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const city = document.getElementById('cityFilter').value;
  const matches = events.filter(function(event) {
    const matchesSearch = event.title.toLowerCase().includes(search) || event.city.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || event.category === category;
    const matchesCity = city === 'all' || event.city === city;
    return matchesSearch && matchesCategory && matchesCity;
  });
  grid.innerHTML = '';
  matches.forEach(function(event) {
    const date = formatDate(event.date);
    const card = document.createElement('article');
    card.className = 'event-card';
    card.innerHTML = '<div class="event-date"><strong>' + date.day + '</strong>' + date.month + '</div>' +
      '<div><p class="event-category">' + safeText(event.category) + '</p><h3>' + safeText(event.title) + '</h3><p>' + date.full + '</p><p>' + safeText(event.venue) + ' · ' + safeText(event.city) + '</p></div>' +
      '<div class="event-action"><span><strong>From ' + formatPrice(getEventLowestPrice(event)) + '</strong><small>' + getEventAvailability(event) + ' tickets available</small></span><a class="button" aria-label="View tickets for ' + safeText(event.title) + '" href="checkout.html?event=' + event.id + '">Tickets</a></div>';
    grid.appendChild(card);
  });
  document.getElementById('noResults').hidden = matches.length > 0;
  document.getElementById('resultsStatus').textContent = matches.length + (matches.length === 1 ? ' event found.' : ' events found.');
}

function getEventFromAddress() {
  const eventId = Number(new URLSearchParams(window.location.search).get('event'));
  let foundEvent = null;
  events.forEach(function(event) {
    if (event.id === eventId) foundEvent = event;
  });
  return foundEvent;
}

function updatePrice() {
  const event = getEventFromAddress();
  const typeSelect = document.getElementById('ticketType');
  if (!event || !typeSelect) return;
  const ticket = event.tickets[Number(typeSelect.value)];
  if (!ticket) {
    document.getElementById('ticketHint').textContent = 'All ticket types are sold out.';
    document.getElementById('ticketPrice').textContent = '—';
    document.getElementById('bookingSubmit').disabled = true;
    return;
  }
  const quantityInput = document.getElementById('ticketQuantity');
  const remaining = getRemainingTickets(event, Number(typeSelect.value));
  quantityInput.max = Math.min(10, remaining);
  quantityInput.disabled = remaining === 0;
  document.getElementById('bookingSubmit').disabled = remaining === 0;
  if (Number(quantityInput.value) > remaining && remaining > 0) quantityInput.value = remaining;
  const quantity = Number(quantityInput.value);
  if (remaining === 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(10, remaining)) {
    document.getElementById('ticketPrice').textContent = '—';
  } else {
    document.getElementById('ticketPrice').textContent = formatPrice(ticket.price * quantity);
  }
  document.getElementById('ticketHint').textContent = ticket.detail + ' · ' + remaining + ' available';
}

function startCheckout() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const event = getEventFromAddress();
  const content = document.getElementById('checkoutContent');
  if (!event) {
    content.innerHTML = '<section class="panel"><h2>Please choose an event first.</h2><a class="button" href="index.html">Browse events</a></section>';
    return;
  }
  const account = readSavedData('burundiDemoAccount', null);
  if (!account) {
    const returnToEvent = 'checkout.html?event=' + event.id;
    content.innerHTML = '<section class="panel"><h2>Sign in to book this event</h2><p class="muted">Sign in or create an attendee account to continue to ticket selection.</p><a class="button" href="account.html?next=' + encodeURIComponent(returnToEvent) + '">Sign in to continue</a></section>';
    return;
  }
  document.getElementById('customerName').value = account.name;
  document.getElementById('customerEmail').value = account.email;
  document.getElementById('customerName').readOnly = true;
  document.getElementById('customerEmail').readOnly = true;
  const date = formatDate(event.date);
  document.getElementById('checkoutTitle').textContent = event.title;
  document.getElementById('checkoutMeta').textContent = date.full + ' · ' + event.venue + ', ' + event.city;
  event.tickets.forEach(function(ticket, index) {
    const remaining = getRemainingTickets(event, index);
    const option = document.createElement('option');
    option.value = index;
    option.textContent = ticket.name + ' — ' + formatPrice(ticket.price) + ' (' + remaining + ' left)';
    option.disabled = remaining === 0;
    document.getElementById('ticketType').appendChild(option);
  });
  const firstAvailableType = event.tickets.findIndex(function(ticket, index) { return getRemainingTickets(event, index) > 0; });
  if (firstAvailableType >= 0) document.getElementById('ticketType').value = firstAvailableType;
  const availableTypes = event.tickets.filter(function(ticket, index) { return getRemainingTickets(event, index) > 0; });
  if (availableTypes.length === 0) {
    document.getElementById('ticketHint').textContent = 'All ticket types are sold out.';
    document.getElementById('bookingSubmit').disabled = true;
  }
  document.getElementById('ticketType').addEventListener('change', updatePrice);
  document.getElementById('ticketQuantity').addEventListener('input', updatePrice);
  updatePrice();

  form.addEventListener('submit', function(submitEvent) {
    submitEvent.preventDefault();
    if (!form.reportValidity()) return;
    const selectedTicket = event.tickets[Number(document.getElementById('ticketType').value)];
    const quantity = Number(document.getElementById('ticketQuantity').value);
    const booking = { eventId: event.id, eventTitle: event.title, city: event.city, venue: event.venue, date: event.date, ticketIndex: Number(document.getElementById('ticketType').value), ticket: selectedTicket.name, price: selectedTicket.price, quantity: quantity, totalPrice: selectedTicket.price * quantity, name: account.name, email: account.email, reference: 'BE' + Math.floor(10000 + Math.random() * 90000) };
    const bookings = readSavedData('burundiBookings', []);
    bookings.push(booking);
    saveData('burundiBookings', bookings);
    content.hidden = true;
    const success = document.getElementById('bookingSuccess');
    success.hidden = false;
    success.innerHTML = '<h2>Booking confirmed, ' + safeText(booking.name) + '!</h2><p>Your booking for <strong>' + safeText(booking.eventTitle) + '</strong> has been saved in this browser.</p><p>' + safeText(booking.ticket) + ' × ' + booking.quantity + '<br>Total: ' + formatPrice(booking.totalPrice) + '<br>Reference: <strong>' + booking.reference + '</strong></p><p>Payment has not been processed.</p><a class="button" href="tickets.html">View my tickets</a>';
  });
}

function showBookings() {
  const upcomingList = document.getElementById('upcomingTickets');
  if (!upcomingList) return;
  const account = readSavedData('burundiDemoAccount', null);
  if (!account) {
    document.getElementById('ticketSignIn').hidden = false;
    document.getElementById('upcomingSection').hidden = true;
    document.getElementById('pastSection').hidden = true;
    document.getElementById('discoverMore').hidden = true;
    return;
  }
  const accountEmail = account.email.toLowerCase();
  const allBookings = readSavedData('burundiBookings', []);
  const bookings = allBookings.filter(function(booking) {
    return booking.email && booking.email.toLowerCase() === accountEmail;
  });
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [];
  const past = [];
  bookings.forEach(function(booking) {
    if (booking.date >= today) upcoming.push(booking);
    else past.push(booking);
  });
  addBookingCards(upcoming, upcomingList, false);
  addBookingCards(past, document.getElementById('pastTickets'), true);
  document.getElementById('upcomingEmpty').hidden = upcoming.length > 0;
  document.getElementById('pastEmpty').hidden = past.length > 0;
}

function addBookingCards(bookings, list, isPast) {
  bookings.forEach(function(booking) {
    const card = document.createElement('article');
    card.className = 'ticket-card' + (isPast ? ' past' : '');
    const quantity = booking.quantity || 1;
    const totalPrice = booking.totalPrice || booking.price;
    card.innerHTML = '<p class="eyebrow">' + (isPast ? 'PAST EVENT' : 'UPCOMING EVENT') + '</p><h3>' + safeText(booking.eventTitle) + '</h3><p>' + formatDate(booking.date).full + ' · ' + safeText(booking.city) + '</p><p>' + safeText(booking.venue) + '</p><p>' + safeText(booking.ticket) + ' × ' + quantity + '</p><p>Total: <strong>' + formatPrice(totalPrice) + '</strong></p><p class="ticket-reference">Booking reference: <strong>' + safeText(booking.reference) + '</strong></p>';
    list.appendChild(card);
  });
}

function loadCommunityEvents() {
  const savedEvents = readSavedData('burundiCommunityEvents', []);
  savedEvents.forEach(function(event) { events.push(event); });
}

function setupAccount() {
  const form = document.getElementById('accountForm');
  if (!form) return;
  const savedAccount = readSavedData('burundiDemoAccount', null);
  if (savedAccount) {
    document.getElementById('accountPanel').hidden = true;
    const status = document.getElementById('accountStatus');
    status.hidden = false;
    const roleName = savedAccount.role === 'admin' ? 'Admin' : 'Attendee';
    const roleInfo = savedAccount.role === 'admin' ? 'You can manage event listings and book tickets.' : 'You can book tickets.';
    status.innerHTML = '<h2>Hello, ' + safeText(savedAccount.name) + '.</h2><p class="muted">' + safeText(savedAccount.email) + '</p><p>Account type: <strong>' + roleName + '</strong>. ' + roleInfo + '</p><button class="button" id="signOutButton" type="button">Sign out</button>';
    document.getElementById('signOutButton').addEventListener('click', function() {
      removeSavedData('burundiDemoAccount');
      window.location.reload();
    });
  }
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const account = { name: document.getElementById('accountName').value.trim(), email: document.getElementById('accountEmail').value.trim(), role: document.getElementById('accountRole').value };
    saveData('burundiDemoAccount', account);
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && (next === 'tickets.html' || /^checkout\.html\?event=\d+$/.test(next))) {
      window.location.href = next;
    } else {
      window.location.reload();
    }
  });
}

function setupAddEvent() {
  const form = document.getElementById('addEventForm');
  if (!form) return;
  const account = readSavedData('burundiDemoAccount', null);
  if (!account || account.role !== 'admin') {
    document.getElementById('addEventPanel').innerHTML = '<p>This page is for event organizers. Sign in with an organizer account to add an event.</p><a class="button" href="account.html">Go to account</a>';
    return;
  }
  const dateInput = document.getElementById('newEventDate');
  const ticketTypeList = document.getElementById('ticketTypeList');
  const addTicketButton = document.getElementById('addTicketType');
  let ticketFieldNumber = 1;
  dateInput.min = new Date().toISOString().slice(0, 10);
  addTicketButton.addEventListener('click', function() {
    const currentRows = ticketTypeList.querySelectorAll('.ticket-type-row');
    if (currentRows.length >= 5) return;
    ticketFieldNumber += 1;
    const row = document.createElement('div');
    row.className = 'ticket-type-row';
    row.innerHTML = '<div><label class="sub-label" for="newTicketName' + ticketFieldNumber + '">Ticket name</label><input id="newTicketName' + ticketFieldNumber + '" class="new-ticket-name" required minlength="2" placeholder="e.g. VIP"></div><div><label class="sub-label" for="newTicketPrice' + ticketFieldNumber + '">Price (BIF)</label><input id="newTicketPrice' + ticketFieldNumber + '" class="new-ticket-price" type="number" min="0" step="500" required placeholder="0"></div><div><label class="sub-label" for="newTicketAvailable' + ticketFieldNumber + '">Available</label><input id="newTicketAvailable' + ticketFieldNumber + '" class="new-ticket-available" type="number" min="1" step="1" required placeholder="100"></div><button class="remove-ticket" type="button" aria-label="Remove this ticket type">Remove</button>';
    ticketTypeList.appendChild(row);
    if (ticketTypeList.querySelectorAll('.ticket-type-row').length >= 5) addTicketButton.hidden = true;
  });
  ticketTypeList.addEventListener('click', function(event) {
    if (event.target.matches('.remove-ticket')) {
      event.target.closest('.ticket-type-row').remove();
      addTicketButton.hidden = false;
    }
  });
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const tickets = [];
    ticketTypeList.querySelectorAll('.ticket-type-row').forEach(function(row) {
      tickets.push({
        name: row.querySelector('.new-ticket-name').value.trim(),
        price: Number(row.querySelector('.new-ticket-price').value),
        available: Number(row.querySelector('.new-ticket-available').value),
        detail: 'Ticket option for this event'
      });
    });
    let lowestPrice = tickets[0].price;
    tickets.forEach(function(ticket) {
      if (ticket.price < lowestPrice) lowestPrice = ticket.price;
    });
    const submittedEvent = {
      id: Date.now(),
      title: document.getElementById('newEventTitle').value.trim(),
      city: document.getElementById('newEventCity').value,
      venue: document.getElementById('newEventVenue').value.trim(),
      date: dateInput.value,
      category: document.getElementById('newEventCategory').value,
      price: lowestPrice,
      tickets: tickets
    };
    const savedEvents = readSavedData('burundiCommunityEvents', []);
    savedEvents.push(submittedEvent);
    saveData('burundiCommunityEvents', savedEvents);
    document.getElementById('addEventPanel').hidden = true;
    const confirmation = document.getElementById('eventAdded');
    confirmation.hidden = false;
    confirmation.innerHTML = '<h2>Event submitted</h2><p class="muted">“' + safeText(submittedEvent.title) + '” has been added to the event list in this browser.</p><a class="button" href="index.html">View event list</a>';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const member = readSavedData('burundiDemoAccount', null);
  document.querySelectorAll('[data-member-link]').forEach(function(link) {
    link.hidden = !member || member.role !== 'admin';
  });
  loadCommunityEvents();
  if (document.getElementById('eventGrid')) {
    document.getElementById('searchInput').addEventListener('input', showEvents);
    document.getElementById('categoryFilter').addEventListener('change', showEvents);
    document.getElementById('cityFilter').addEventListener('change', showEvents);
    showEvents();
  }
  startCheckout();
  showBookings();
  setupAccount();
  setupAddEvent();
});
