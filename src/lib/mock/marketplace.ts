import type { OrderStatus } from '@/components/ui/status-badge';

// ---------------------------------------------------------------------------
// UI-placeholder data.
// The order / chat / review / payment flows don't have a backend yet — this
// module is the single source of fixture data those pages render, so the UI
// can be built and demoed end-to-end. Swap each `find*` helper for a real
// service-layer call once the corresponding API exists; page components were
// written to only touch these functions, never the shape of the array, so
// that swap stays localized.
// ---------------------------------------------------------------------------

export type MockReview = {
    id: string;
    author: string;
    rating: number;
    timeAgo: string;
    comment: string;
};

export type MockTechnicianService = {
    id: string;
    title: string;
    subtitle: string;
    priceBaht: number;
};

export type MockTechnician = {
    slug: string;
    displayName: string;
    categoryLabel: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    memberSince: string;
    location: string;
    bio: string;
    jobsCompleted: number;
    avgResponseTime: string;
    services: MockTechnicianService[];
    reviews: MockReview[];
};

export const MOCK_TECHNICIANS: MockTechnician[] = [
    {
        slug: 'netpro-solutions',
        displayName: 'NetPro Solutions',
        categoryLabel: 'เครือข่าย',
        rating: 4.9,
        reviewCount: 37,
        verified: true,
        memberSince: '2566',
        location: 'กรุงเทพฯ และปริมณฑล',
        bio: 'ทีมวางระบบเครือข่ายและ IT ครบวงจรสำหรับ SME และออฟฟิศ ประสบการณ์กว่า 8 ปี รับงานเดินสาย LAN, ตั้งค่า Router/Switch/AP, วางระบบกล้อง และดูแลระบบรายเดือน เน้นงานเป็นระบบ มีเอกสารส่งมอบครบ',
        jobsCompleted: 142,
        avgResponseTime: '~1 ชม.',
        services: [
            { id: 'svc-network-office', title: 'วางระบบเครือข่ายออฟฟิศ', subtitle: 'รับ 10-30 จุด พร้อมทดสอบความเร็ว', priceBaht: 4500 },
            { id: 'svc-access-point', title: 'ติดตั้ง Access Point ครอบคลุมทั้งชั้น', subtitle: 'Wi-Fi 6 · วางแผนสัญญาณ', priceBaht: 2800 },
            { id: 'svc-cctv', title: 'ติดตั้งกล้องวงจรปิด IP Camera', subtitle: '4-16 ตัว พร้อมดูผ่านมือถือ', priceBaht: 6000 },
            { id: 'svc-it-ma', title: 'ดูแลระบบ IT รายเดือน (MA)', subtitle: 'ออนไซต์เดือนละครั้ง + รีโมท', priceBaht: 3500 },
        ],
        reviews: [
            { id: 'rev-1', author: 'คุณเอกชัย', rating: 5, timeAgo: '2 สัปดาห์ก่อน', comment: 'ทำงานเป็นระบบมาก มีไดอะแกรมให้ครบ ทีม IT ทำงานต่อง่ายเลย' },
            { id: 'rev-2', author: 'คุณมาลี', rating: 5, timeAgo: '1 เดือนก่อน', comment: 'ตรงเวลา ราคาตามที่ตกลง เน็ตเสถียรทุกจุดจริง' },
            { id: 'rev-3', author: 'คุณธนา', rating: 5, timeAgo: '2 เดือนก่อน', comment: 'งานดี ราคาสมเหตุสมผล แต่เริ่มงานช้ากว่านัดนิดหน่อย' },
        ],
    },
    {
        slug: 'chang-somchai',
        displayName: 'ช่างสมชาย',
        categoryLabel: 'ลง Windows',
        rating: 4.9,
        reviewCount: 37,
        verified: true,
        memberSince: '2565',
        location: 'กรุงเทพฯ และปริมณฑล',
        bio: 'รับลง Windows พร้อมไดรเวอร์ครบ ล้างไวรัส เพิ่มความเร็วเครื่อง ถึงบ้าน/คอนโดในกรุงเทพฯ นัดหมายง่าย ราคาชัดเจนตั้งแต่แรก',
        jobsCompleted: 96,
        avgResponseTime: '~30 นาที',
        services: [
            { id: 'svc-windows-full', title: 'ลง Windows + ไดรเวอร์ครบ', subtitle: 'ถึงบ้าน หรือรีโมทได้', priceBaht: 500 },
            { id: 'svc-antivirus', title: 'ล้างไวรัส + เพิ่มความเร็ว', subtitle: 'สแกนเต็มระบบ + ลบโปรแกรมขยะ', priceBaht: 700 },
            { id: 'svc-ssd-upgrade', title: 'อัปเกรด SSD + ย้ายระบบ', subtitle: 'ย้ายข้อมูลไม่ต้องลงใหม่', priceBaht: 1200 },
        ],
        reviews: [
            { id: 'rev-4', author: 'คุณปรีชา', rating: 5, timeAgo: '1 สัปดาห์ก่อน', comment: 'ลงให้เร็วมาก อธิบายทุกขั้นตอน ประทับใจครับ' },
            { id: 'rev-5', author: 'คุณสุดา', rating: 5, timeAgo: '3 สัปดาห์ก่อน', comment: 'เครื่องเร็วขึ้นเยอะ ราคาย่อมเยาว์ตามที่โฆษณา' },
        ],
    },
    {
        slug: 'techbuild',
        displayName: 'TechBuild',
        categoryLabel: 'ประกอบเครื่อง',
        rating: 4.8,
        reviewCount: 52,
        verified: true,
        memberSince: '2564',
        location: 'กรุงเทพฯ และปริมณฑล',
        bio: 'ประกอบคอมพิวเตอร์ตามสเปก เน้นเกมมิ่งและงานกราฟิก เลือกอุปกรณ์ให้เหมาะกับงบ พร้อมทดสอบเบิร์นอินก่อนส่งมอบทุกเครื่อง',
        jobsCompleted: 118,
        avgResponseTime: '~2 ชม.',
        services: [
            { id: 'svc-pc-build', title: 'ประกอบคอมพิวเตอร์ตามสเปก', subtitle: 'เลือกอุปกรณ์ + ประกอบ + ทดสอบ', priceBaht: 1500 },
            { id: 'svc-gaming-pc', title: 'ประกอบคอมทำงาน/เกมมิ่ง งบ 30k', subtitle: 'สเปกแนะนำตามงบประมาณ', priceBaht: 29400 },
        ],
        reviews: [
            { id: 'rev-6', author: 'คุณมานี', rating: 5, timeAgo: '5 วันก่อน', comment: 'ประกอบเรียบร้อย สายไฟจัดสวยงาม เทสเบิร์นอินให้ดูด้วย' },
        ],
    },
];

export function findTechnician(nameOrSlug: string): MockTechnician {
    const decoded = decodeURIComponent(nameOrSlug);
    const found = MOCK_TECHNICIANS.find(
        (t) => t.slug === decoded || t.displayName === decoded || t.slug === nameOrSlug,
    );
    if (found) return found;

    // Unknown id (e.g. a real technician from the database with no curated
    // profile yet) — synthesize a minimal-but-presentable profile so the page
    // never 404s while the real backend is still catching up to the UI.
    return {
        slug: nameOrSlug,
        displayName: decoded,
        categoryLabel: 'ช่างทั่วไป',
        rating: 5,
        reviewCount: 0,
        verified: false,
        memberSince: '2569',
        location: 'กรุงเทพฯ และปริมณฑล',
        bio: 'ช่างคนนี้ยังไม่มีข้อมูลโปรไฟล์เพิ่มเติม',
        jobsCompleted: 0,
        avgResponseTime: '—',
        services: [],
        reviews: [],
    };
}

// ---------------------------------------------------------------------------

export type QuoteVersion = {
    version: number;
    priceBaht: number;
    status: 'accepted' | 'awaiting_response' | 'superseded';
    submittedAt: string;
    durationLabel: string;
    note: string;
};

export type OrderStep = {
    key: string;
    label: string;
    timestamp?: string;
    state: 'done' | 'current' | 'pending';
};

export type MockOrder = {
    id: string;
    serviceTitle: string;
    technicianName: string;
    customerName: string;
    status: OrderStatus;
    priceBaht: number;
    feePercent: number;
    createdAt: string;
    durationLabel: string;
    equipmentLabel: string;
    revisionsLabel: string;
    customerBrief: string;
    quotes: QuoteVersion[];
    steps: OrderStep[];
};

export const MOCK_ORDERS: MockOrder[] = [
    {
        id: 'ORD-2043',
        serviceTitle: 'วางระบบเครือข่ายออฟฟิศ 10-30 จุด',
        technicianName: 'NetPro Solutions',
        customerName: 'ปรีชา ก.',
        status: 'quoted',
        priceBaht: 5200,
        feePercent: 10,
        createdAt: '14 ก.ย. 2569',
        durationLabel: '3-5 วัน',
        equipmentLabel: 'สาย + ราง',
        revisionsLabel: '2 ครั้ง',
        customerBrief:
            'ออฟฟิศชั้น 12 ประมาณ 22 จุด มีตู้ Rack อยู่แล้ว อยากได้เดินสายใหม่ทั้งหมด + ตั้งค่า AP 3 ตัว งบราว 5,000 เข้าทำงานเสาร์-อาทิตย์ได้',
        quotes: [
            { version: 1, priceBaht: 4500, status: 'superseded', submittedAt: '14 ก.ย. 11:10', durationLabel: '3-5 วัน', note: 'เสนอราคาเริ่มต้นตามรายละเอียดงาน' },
            { version: 2, priceBaht: 5200, status: 'awaiting_response', submittedAt: '14 ก.ย. 15:02', durationLabel: '3-5 วัน', note: 'ปรับราคาขึ้นจากเดิมเพราะเพิ่ม AP เป็น 3 ตัวและเดินสายใหม่ทั้งชั้นครับ' },
        ],
        steps: [
            { key: 'opened', label: 'เปิดออเดอร์', timestamp: '14 ก.ย. 2569 · 10:24', state: 'done' },
            { key: 'quoted', label: 'ช่างเสนอราคา (เวอร์ชัน 2)', timestamp: '14 ก.ย. 2569 · 15:02 · รอคุณตอบรับข้อเสนอ', state: 'current' },
            { key: 'payment', label: 'ชำระเงิน (พักไว้แบบ Escrow)', state: 'pending' },
            { key: 'working', label: 'ช่างเข้าทำงาน', state: 'pending' },
            { key: 'done', label: 'ยืนยันงานเสร็จ · โอนเงินให้ช่าง', state: 'pending' },
        ],
    },
    {
        id: 'ORD-2038',
        serviceTitle: 'ประกอบคอมทำงาน/เกมมิ่ง งบ 30k',
        technicianName: 'TechBuild',
        customerName: 'ปรีชา ก.',
        status: 'in_progress',
        priceBaht: 29400,
        feePercent: 10,
        createdAt: '12 ก.ย. 2569',
        durationLabel: '2-3 วัน',
        equipmentLabel: 'ลูกค้าจัดหาอุปกรณ์',
        revisionsLabel: '1 ครั้ง',
        customerBrief: 'อยากได้เครื่องเล่นเกมสาย AAA เล่น 1440p งบรวมเคส-จอ-คีย์บอร์ดไม่เกิน 30,000 บาท',
        quotes: [
            { version: 1, priceBaht: 29400, status: 'accepted', submittedAt: '12 ก.ย. 09:40', durationLabel: '2-3 วัน', note: 'สเปกตามงบที่แจ้ง พร้อมประกอบและทดสอบเบิร์นอิน' },
        ],
        steps: [
            { key: 'opened', label: 'เปิดออเดอร์', timestamp: '12 ก.ย. 2569', state: 'done' },
            { key: 'quoted', label: 'ช่างเสนอราคา', timestamp: '12 ก.ย. 2569', state: 'done' },
            { key: 'payment', label: 'ชำระเงิน (พักไว้แบบ Escrow)', timestamp: '12 ก.ย. 2569', state: 'done' },
            { key: 'working', label: 'ช่างเข้าทำงาน', timestamp: 'กำลังดำเนินการ', state: 'current' },
            { key: 'done', label: 'ยืนยันงานเสร็จ · โอนเงินให้ช่าง', state: 'pending' },
        ],
    },
    {
        id: 'ORD-2031',
        serviceTitle: 'ลง Windows + Office ที่บ้าน',
        technicianName: 'ช่างสมชาย',
        customerName: 'ปรีชา ก.',
        status: 'awaiting_payment',
        priceBaht: 800,
        feePercent: 10,
        createdAt: '9 ก.ย. 2569',
        durationLabel: '1 วัน',
        equipmentLabel: 'ช่างนำแฟลชไดรฟ์มาเอง',
        revisionsLabel: '1 ครั้ง',
        customerBrief: 'โน้ตบุ๊คช้ามาก อยากลง Windows ใหม่ + Office ที่บ้านช่วงเย็นวันธรรมดา',
        quotes: [
            { version: 1, priceBaht: 800, status: 'accepted', submittedAt: '9 ก.ย. 2569', durationLabel: '1 วัน', note: 'ลง Windows + Office + ไดรเวอร์ครบ ถึงที่บ้าน' },
        ],
        steps: [
            { key: 'opened', label: 'เปิดออเดอร์', timestamp: '9 ก.ย. 2569', state: 'done' },
            { key: 'quoted', label: 'ช่างเสนอราคา', timestamp: '9 ก.ย. 2569', state: 'done' },
            { key: 'payment', label: 'ชำระเงิน (พักไว้แบบ Escrow)', timestamp: 'รอชำระเงิน', state: 'current' },
            { key: 'working', label: 'ช่างเข้าทำงาน', state: 'pending' },
            { key: 'done', label: 'ยืนยันงานเสร็จ · โอนเงินให้ช่าง', state: 'pending' },
        ],
    },
    {
        id: 'ORD-2019',
        serviceTitle: 'ล้างไวรัส + เพิ่มความเร็ว',
        technicianName: 'SpeedUp',
        customerName: 'ปรีชา ก.',
        status: 'completed',
        priceBaht: 700,
        feePercent: 10,
        createdAt: '1 ก.ย. 2569',
        durationLabel: '1 วัน',
        equipmentLabel: '-',
        revisionsLabel: '-',
        customerBrief: 'เครื่องช้า สงสัยติดไวรัส อยากให้ตรวจและล้างให้',
        quotes: [
            { version: 1, priceBaht: 700, status: 'accepted', submittedAt: '1 ก.ย. 2569', durationLabel: '1 วัน', note: 'ตรวจสแกนไวรัสเต็มระบบ + ลบโปรแกรมขยะ' },
        ],
        steps: [
            { key: 'opened', label: 'เปิดออเดอร์', timestamp: '1 ก.ย. 2569', state: 'done' },
            { key: 'quoted', label: 'ช่างเสนอราคา', timestamp: '1 ก.ย. 2569', state: 'done' },
            { key: 'payment', label: 'ชำระเงิน (พักไว้แบบ Escrow)', timestamp: '1 ก.ย. 2569', state: 'done' },
            { key: 'working', label: 'ช่างเข้าทำงาน', timestamp: '1 ก.ย. 2569', state: 'done' },
            { key: 'done', label: 'ยืนยันงานเสร็จ · โอนเงินให้ช่าง', timestamp: '1 ก.ย. 2569', state: 'done' },
        ],
    },
];

export function findOrder(id: string): MockOrder | undefined {
    return MOCK_ORDERS.find((o) => o.id === id);
}

// ---------------------------------------------------------------------------

export type ChatMessage = {
    id: string;
    author: 'me' | 'them';
    text: string;
    time: string;
};

export const MOCK_CHAT: Record<string, ChatMessage[]> = {
    'ORD-2043': [
        { id: 'm1', author: 'them', text: 'สวัสดีครับ รบกวนถามจุดที่ต้องเดินสายทั้งหมด มีประมาณกี่จุดครับ', time: '10:26' },
        { id: 'm2', author: 'me', text: 'ประมาณ 22 จุดครับ ชั้น 12 มีตู้ Rack อยู่แล้ว', time: '10:31' },
        { id: 'm3', author: 'them', text: 'เข้าใจแล้วครับ จะส่งใบเสนอราคาให้ตอนบ่ายครับ', time: '10:33' },
    ],
    'ORD-2038': [
        { id: 'm1', author: 'them', text: 'เริ่มประกอบเครื่องแล้วนะครับ คาดว่าเสร็จวันพรุ่งนี้', time: '09:15' },
        { id: 'm2', author: 'me', text: 'โอเคครับ ขอบคุณครับ', time: '09:20' },
    ],
};

export function findChat(orderId: string): ChatMessage[] {
    return MOCK_CHAT[orderId] ?? [];
}
