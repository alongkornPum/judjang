# 📱 JuDJanG (จัดจ้าง/จัดจ่าง) - UI/UX & AI Prompt Guide

**JuDJanG** คือเว็บแอปพลิเคชันจัดการรายรับ-รายจ่ายส่วนบุคคล ออกแบบภายใต้แนวคิด **Minimalist, Fast Entry & Clear Data Visualization** สำหรับใช้งานทั้งบน Mobile และ Desktop

---

## 🎯 1. Core UX Concepts & Design System

### หลักการออกแบบ (Design Philosophy)
* **Zero Friction:** บันทึกรายการได้รวดเร็วภายใน 3 วินาที
* **Progressive Disclosure:** แสดงผลเฉพาะข้อมูลสำคัญในหน้าหลัก รายละเอียดเชิงลึกสามารถคลิกเข้าไปดูเพิ่มเติมได้
* **Thumb Zone Optimization:** จัดวางปุ่มสำคัญบนมือถือให้อยู่ในระยะที่นิ้วโป้งเอื้อมถึงได้ง่าย

### Design Theme & Color System
* **Background:** `#F8F9FA` (Off-white สบายตา ลดความล้าของสายตา)
* **Primary Text / Dark Accent:** `#2D3748` (สีเทาเข้ม/ดำนุ่มนวล)
* **Income (รายรับ):** `#10B981` (เขียวมินต์)
* **Expense (รายจ่าย):** `#EF4444` (แดงซอฟต์)
* **Typography:** Modern Sans-serif (*Inter*, *Kanit*, หรือ *IBM Plex Sans Thai*)

---

## 📐 2. Wireframe & Layout Architecture

### 📱 Mobile View (Focus: Quick Entry & Navigation)
```text
+-----------------------------------+
|  [Header]  JuDJanG        [Profile]|
|-----------------------------------|
|  [Summary Card]                   |
|  ยอดคงเหลือสุทธิ                     |
|  ฿ 45,000.00                      |
|                                   |
|  [↑ รายรับ 50,000] [↓ รายจ่าย 5,000] |
|-----------------------------------|
|  [Tabs] วันนี้ | เดือนนี้ | ปีนี้   |
|                                   |
|  รายการล่าสุด                     |
|  🍔 อาหาร        -120.00          |
|  ☕ กาแฟ          -65.00          |
|  💼 เงินเดือน   +50,000.00          |
|                                   |
|-----------------------------------|
| [ Bottom Nav Bar ]                |
|  [🏠 หน้าแรก]   [ (+) บันทึก ]   [📊 สรุป] |
+-----------------------------------+
```

### 💻 Desktop View (Focus: Comprehensive Dashboard)
```text
+-----------------------------------------------------------------------+
| JuDJanG      [🏠 หน้าแรก] [📊 รายงานสรุป] [⚙️ ตั้งค่า]        [Profile] |
+---------------+-------------------------------------------------------+
| [ Left Bar ]  | [ Top Overview Cards ]                                |
|  - สรุปด่วน    |  [ รายรับรวม ]    [ รายจ่ายรวม ]    [ คงเหลือสุทธิ ]   |
|  - หมวดหมู่   +-------------------------------------------------------+
|  - ส่งออก Excel| [ Main Content Split View ]                           |
|               |  Left Column (60%)       | Right Column (40%)         |
|               |  - กราฟสรุปรายเดือน       | - ตารางรายการล่าสุด         |
|               |  - สัดส่วนตามประเภท      | - ปุ่ม [+ เพิ่มรายการใหม่]  |
|               |    (Donut Chart)         | - ช่อง Filter / Search     |
+---------------+-------------------------------------------------------+
```

---

## 🎨 3. Prompts for AI Image Generation

คุณสามารถนำ พรอมต์ (Prompts) ด้านล่างนี้ไปใช้กับเครื่องมือสร้างภาพด้วย AI เช่น **Midjourney**, **DALL-E 3**, หรือ **Google Imagen** เพื่อสร้างภาพ UI Mockup ได้ทันที:

### 📱 3.1 Mobile App UI Prompt
```text
Clean and modern mobile app UI/UX design for a personal finance tracker named "JuDJanG". Minimalist light mode interface, soft off-white background (#F8F9FA). Displaying a dashboard with a total balance summary card at the top, soft green badge for income (+฿50,000) and soft red badge for expense (-฿5,000). Below is a clean transaction list with category icons like food, coffee, and salary. Floating bottom navigation bar with a prominent center plus (+) button for adding new transactions. Clean typography (modern sans-serif), highly usable, elegant spacing, sleek aesthetic, high-resolution UI design mockup --ar 9:16 --v 6.0
```

### 💻 3.2 Desktop Web Dashboard Prompt
```text
Minimalist web application dashboard UI/UX design for a finance management system named "JuDJanG". Desktop screen view, clean light theme UI, ultra-modern and spacious layout. Top header with navigation links and profile. Main dashboard features three summary metric cards (Total Income, Total Expense, Net Balance) with subtle pastel accents. Center area displays an elegant donut chart showing expense category breakdown (Food, Transportation, Utilities) alongside a sleek recent transactions data table. Neutral gray background, elegant typography, intuitive layout, professional Figma style shot --ar 16:9 --v 6.0
```

### 🎨 3.3 UI Design System & Component Prompt
```text
UI Design system grid for a minimalist personal finance app "JuDJanG". Includes color palette swatches (off-white #F8F9FA, dark slate #2D3748, mint green #10B981, soft crimson #EF4444), modern sans-serif typography hierarchy, clean iconography set for categories (food, bills, transport, income), rounded buttons, and interactive modal dialog for adding income and expenses. Flat design, clean vector aesthetics, Behance/Dribbble quality showcase --ar 16:9 --v 6.0
```

---

## 🤖 4. Prompt for Coding AI Assistance (Claude / ChatGPT)

หากต้องการนำไปใช้สั่ง AI ให้ช่วยสร้าง Code HTML/CSS (Tailwind CSS) หรือ React สามารถใช้พรอมต์นี้ได้เลย:

```text
Act as a Senior Frontend Developer specializing in React and Tailwind CSS. Help me build a responsive web application named "JuDJanG", a minimalist income and expense tracker.

Requirements:
1. Tech Stack: React (Functional Components), Tailwind CSS, Lucide-react icons.
2. Responsive Layout:
   - Mobile: Bottom navigation bar with a centered action (+) button, card-based transaction feeds, compact summary cards.
   - Desktop: Top navigation bar, 3 KPI overview cards (Income, Expense, Balance), 2-column dashboard layout (Chart/Analytics on left, Transaction list & Quick add on right).
3. Features needed:
   - Switch tabs between Daily, Monthly, and Yearly summaries.
   - Categorized transaction entries with custom icon badges.
   - Clean forms/modals for adding new income or expense items.
4. Styling: Clean, modern, minimalist, with off-white background (#F8F9FA), dark text (#2D3748), soft green (#10B981) for income, and soft red (#EF4444) for expenses.

Please write clean, modular, and fully functional React code.
```