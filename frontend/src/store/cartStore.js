import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: [],
    pickupDate: null,
    pickupAddress: '',
    notes: '',

    // Add item to cart
    addItem: (service) => {
        const items = get().items;
        const existingIndex = items.findIndex(item => item.service_id === service.id);

        if (existingIndex >= 0) {
            // Update quantity if already in cart
            const newItems = [...items];
            newItems[existingIndex].quantity += 1;
            set({ items: newItems });
        } else {
            // Add new item
            set({
                items: [...items, {
                    service_id: service.id,
                    name: service.name,
                    price: parseFloat(service.price),
                    unit: service.unit,
                    quantity: service.unit === 'kg' ? 1 : 1,
                }],
            });
        }
    },

    // Update item quantity
    updateQuantity: (serviceId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(serviceId);
            return;
        }

        const items = get().items.map(item =>
            item.service_id === serviceId
                ? { ...item, quantity }
                : item
        );
        set({ items });
    },

    // Remove item from cart
    removeItem: (serviceId) => {
        set({ items: get().items.filter(item => item.service_id !== serviceId) });
    },

    // Clear cart
    clearCart: () => {
        set({
            items: [],
            pickupDate: null,
            pickupAddress: '',
            notes: '',
        });
    },

    // Set pickup details
    setPickupDetails: (details) => {
        set({
            pickupDate: details.pickupDate || get().pickupDate,
            pickupAddress: details.pickupAddress || get().pickupAddress,
            notes: details.notes || get().notes,
        });
    },

    // Calculate total
    getTotal: () => {
        return get().items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    // Get cart count
    getCount: () => get().items.length,

    // Prepare order data for API
    getOrderData: () => ({
        pickup_date: get().pickupDate,
        pickup_address: get().pickupAddress,
        notes: get().notes,
        items: get().items.map(item => ({
            service_id: item.service_id,
            quantity: item.quantity,
        })),
    }),
}));

export default useCartStore;
