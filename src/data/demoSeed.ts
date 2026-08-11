import { dataManagementService, CORESTACK_DATA_KEYS } from '@/services/DataManagementService';

// Utilities
const generateId = (prefix: string, index: number) => `${prefix}-${index.toString().padStart(3, '0')}`;
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};
const randomArray = <T>(arr: T[], count: number = 1): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const FIRST_NAMES = ["Aarav", "Vihaan", "Aditya", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Diya", "Saanvi", "Aanya", "Priya", "Neha", "Riya", "Kavya", "Ananya", "Ishita", "Sneha"];
const LAST_NAMES = ["Patel", "Sharma", "Singh", "Kumar", "Das", "Bose", "Mehta", "Shah", "Reddy", "Verma", "Chauhan", "Joshi", "Kapoor", "Yadav", "Gupta", "Rao", "Mishra", "Nair", "Iyer", "Garg"];

const CLIENT_COMPANIES = ["Reliance Industries", "Tata Consultancy Services", "HDFC Bank", "Infosys", "ICICI Bank", "Hindustan Unilever", "State Bank of India", "Bajaj Finance", "Bharti Airtel", "Kotak Mahindra Bank", "Wipro", "Asian Paints", "HCL Technologies", "Maruti Suzuki", "Sun Pharmaceutical", "Titan Company", "UltraTech Cement", "Nestle India", "Tech Mahindra", "Adani Green Energy"];

const DEPARTMENTS = [
  { name: "Taxation", code: "TAX" },
  { name: "Audit & Assurance", code: "AUD" },
  { name: "Accounting & Bookkeeping", code: "ACC" },
  { name: "Corporate Compliance", code: "COR" },
  { name: "Advisory Services", code: "ADV" },
  { name: "Legal", code: "LEG" },
  { name: "Human Resources", code: "HR" },
  { name: "Administration", code: "ADM" }
];

const ROLES = [
  { name: "Super Admin", code: "SUPER_ADMIN", level: 1 },
  { name: "Partner", code: "PARTNER", level: 2 },
  { name: "Manager", code: "MANAGER", level: 3 },
  { name: "Senior Executive", code: "SENIOR_EXEC", level: 4 },
  { name: "Executive", code: "EXEC", level: 5 },
  { name: "Trainee/Article", code: "TRAINEE", level: 6 },
  { name: "Support Staff", code: "SUPPORT", level: 7 }
];

const DESIGNATIONS = [
  { name: "Managing Partner", deptCode: "ADM", level: 1 },
  { name: "Audit Partner", deptCode: "AUD", level: 2 },
  { name: "Tax Partner", deptCode: "TAX", level: 2 },
  { name: "Senior Tax Consultant", deptCode: "TAX", level: 3 },
  { name: "Audit Manager", deptCode: "AUD", level: 3 },
  { name: "Compliance Manager", deptCode: "COR", level: 3 },
  { name: "Senior Accountant", deptCode: "ACC", level: 4 },
  { name: "Legal Advisor", deptCode: "LEG", level: 4 },
  { name: "Tax Executive", deptCode: "TAX", level: 5 },
  { name: "Audit Executive", deptCode: "AUD", level: 5 },
  { name: "Junior Accountant", deptCode: "ACC", level: 5 },
  { name: "Article Assistant", deptCode: "AUD", level: 6 },
  { name: "HR Manager", deptCode: "HR", level: 3 },
  { name: "Admin Executive", deptCode: "ADM", level: 5 },
  { name: "Office Assistant", deptCode: "ADM", level: 7 }
];

const DEFAULT_PERMISSIONS = {
  dashboard: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  departments: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  roles: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  designations: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  employees: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  clients: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  tasks: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  documents: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  billing: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  reports: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  notifications: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  settings: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
  activityLogs: { view: true, create: false, edit: false, archive: false, restore: false, export: false, assign: false, approve: false, manage: false },
};

const ALL_PERMISSIONS = Object.keys(DEFAULT_PERMISSIONS).reduce((acc, key) => {
  acc[key as keyof typeof DEFAULT_PERMISSIONS] = { view: true, create: true, edit: true, archive: true, restore: true, export: true, assign: true, approve: true, manage: true };
  return acc;
}, {} as any);

export const seedRealisticDemoData = async () => {
  const now = new Date().toISOString();

  // 1. Generate Departments
  const departments = DEPARTMENTS.map((d, i) => ({
    id: generateId('dept', i + 1),
    name: d.name,
    code: d.code,
    description: `${d.name} Department`,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    isArchived: false
  }));

  // 2. Generate Roles
  const roles = ROLES.map((r, i) => ({
    id: generateId('role', i + 1),
    name: r.name,
    code: r.code,
    hierarchyLevel: r.level,
    permissions: r.level <= 2 ? ALL_PERMISSIONS : DEFAULT_PERMISSIONS, // Simple assignment
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    isArchived: false
  }));

  // 3. Generate Designations
  const designations = DESIGNATIONS.map((d, i) => {
    const dept = departments.find(dept => dept.code === d.deptCode);
    return {
      id: generateId('desig', i + 1),
      name: d.name,
      code: `DESIG-${i + 1}`,
      departmentId: dept?.id,
      departmentName: dept?.name,
      hierarchyLevel: d.level,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      isArchived: false
    };
  });

  // 4. Generate Employees
  const employees = [];
  
  // Specific requested employees
  const specificEmployees = [
    { fn: "Kalp", ln: "Shah", roleCode: "MANAGER", desigName: "Senior Tax Consultant" },
    { fn: "Rahul", ln: "Patel", roleCode: "SENIOR_EXEC", desigName: "Senior Accountant" },
    { fn: "Ajay", ln: "Mehta", roleCode: "EXEC", desigName: "Tax Executive" }
  ];

  const totalEmployees = 30;
  for (let i = 0; i < totalEmployees; i++) {
    const isSpecific = i < specificEmployees.length;
    const fn = isSpecific ? specificEmployees[i].fn : randomItem(FIRST_NAMES);
    const ln = isSpecific ? specificEmployees[i].ln : randomItem(LAST_NAMES);
    
    let desig: any = null;
    let role: any = null;
    let dept: any = null;

    if (isSpecific) {
      desig = designations.find(d => d.name === specificEmployees[i].desigName);
      role = roles.find(r => r.code === specificEmployees[i].roleCode);
      if (desig) dept = departments.find(d => d.id === desig.departmentId);
    } else {
      desig = randomItem(designations);
      role = roles.find(r => r.hierarchyLevel === desig.hierarchyLevel) || randomItem(roles);
      dept = departments.find(d => d.id === desig.departmentId) || randomItem(departments);
    }

    employees.push({
      id: generateId('emp', i + 1),
      employeeId: `EMP-${(1000 + i).toString()}`,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@corestack.demo`,
      mobile: `+9198${randomInt(10000000, 99999999)}`,
      gender: ['MALE', 'FEMALE'][randomInt(0, 1)],
      dob: randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31)),
      address: `Random Address ${i}, City`,
      departmentId: dept?.id || departments[0].id,
      departmentName: dept?.name || departments[0].name,
      roleId: role?.id || roles[0].id,
      roleName: role?.name || roles[0].name,
      designationId: desig?.id || designations[0].id,
      designationName: desig?.name || designations[0].name,
      joiningDate: randomDate(new Date(2015, 0, 1), new Date(2023, 11, 31)),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      isArchived: false
    });
  }

  // 5. Generate Clients
  const clients = [];
  const totalClients = 40;
  for (let i = 0; i < totalClients; i++) {
    const isCompany = randomInt(0, 1) === 1;
    const type = isCompany ? randomItem(['BUSINESS', 'COMPANY', 'PARTNERSHIP', 'LLP']) : 'INDIVIDUAL';
    const cName = isCompany ? (i < CLIENT_COMPANIES.length ? CLIENT_COMPANIES[i] : `Company ${i}`) : `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    
    // Assign managers and employees
    const managers = employees.filter(e => e.roleName === 'Manager' || e.roleName === 'Partner');
    const manager = randomItem(managers);
    const assignedStaff = randomArray(employees, randomInt(1, 4)).map(e => e.id);

    clients.push({
      id: generateId('client', i + 1),
      clientCode: `CL-${1000 + i}`,
      clientType: type,
      clientName: cName,
      companyName: isCompany ? cName : undefined,
      pan: `ABCDE${randomInt(1000, 9999)}F`,
      mobile: `+9199${randomInt(10000000, 99999999)}`,
      email: `contact@${cName.toLowerCase().replace(/[^a-z]/g, '')}.demo`,
      managerId: manager?.id,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : undefined,
      employeeIds: assignedStaff,
      status: 'ACTIVE',
      priority: randomItem(['LOW', 'MEDIUM', 'HIGH']),
      createdAt: now,
      updatedAt: now,
      isArchived: false
    });
  }

  // 6. Generate Tasks
  const tasks = [];
  const taskCategories = ['GST Return', 'Income Tax Return', 'Audit', 'Bookkeeping', 'ROC Filing', 'TDS'];
  const taskStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];
  
  const totalTasks = 120;
  for (let i = 0; i < totalTasks; i++) {
    const client = randomItem(clients);
    const category = randomItem(taskCategories);
    const staff = randomArray(employees, randomInt(1, 3));
    
    tasks.push({
      id: generateId('task', i + 1),
      taskCode: `TSK-${1000 + i}`,
      taskName: `${category} for ${client.clientName}`,
      clientId: client.id,
      clientName: client.clientName,
      employeeIds: staff.map(e => e.id),
      category: category,
      priority: randomItem(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      status: randomItem(taskStatuses),
      startDate: randomDate(new Date(2023, 0, 1), new Date()),
      dueDate: randomDate(new Date(), new Date(2024, 11, 31)),
      estimatedHours: randomInt(2, 40),
      tags: [category],
      checklist: [
        { id: generateId('chk', i * 3 + 1), title: 'Collect documents', isCompleted: randomInt(0, 1) === 1 },
        { id: generateId('chk', i * 3 + 2), title: 'Draft report', isCompleted: randomInt(0, 1) === 1 },
        { id: generateId('chk', i * 3 + 3), title: 'Client approval', isCompleted: false },
      ],
      createdAt: now,
      updatedAt: now,
      isArchived: false
    });
  }

  // 7. Generate Invoices & Payments
  const invoices = [];
  const payments = [];
  const totalInvoices = 60;
  for (let i = 0; i < totalInvoices; i++) {
    const client = randomItem(clients);
    const amount = randomInt(5000, 150000);
    const isPaid = randomInt(0, 1) === 1;
    const isPartial = !isPaid && randomInt(0, 1) === 1;
    
    const paidAmount = isPaid ? amount : (isPartial ? Math.floor(amount / 2) : 0);
    const status = isPaid ? 'PAID' : (isPartial ? 'PARTIALLY_PAID' : 'SENT');

    const invoiceId = generateId('inv', i + 1);
    invoices.push({
      id: invoiceId,
      invoiceNumber: `INV-2024-${(100 + i).toString()}`,
      type: 'INVOICE',
      clientId: client.id,
      clientName: client.clientName,
      taskIds: [],
      billingDate: randomDate(new Date(2023, 0, 1), new Date()),
      dueDate: randomDate(new Date(), new Date(2024, 11, 31)),
      items: [
        { id: generateId('item', i), description: 'Professional Services', quantity: 1, rate: amount, amount: amount }
      ],
      subtotal: amount,
      discountPercentage: 0,
      discountAmount: 0,
      taxPercentage: 18,
      taxAmount: amount * 0.18,
      totalAmount: amount * 1.18,
      paidAmount: paidAmount * 1.18,
      balanceAmount: (amount - paidAmount) * 1.18,
      status: status,
      createdAt: now,
      updatedAt: now,
      isArchived: false
    });

    if (paidAmount > 0) {
      payments.push({
        id: generateId('pay', i + 1),
        paymentId: `PAY-${1000 + i}`,
        invoiceId: invoiceId,
        invoiceNumber: `INV-2024-${(100 + i).toString()}`,
        clientId: client.id,
        amount: paidAmount * 1.18,
        paymentDate: randomDate(new Date(2023, 0, 1), new Date()),
        paymentMethod: randomItem(['BANK_TRANSFER', 'CHEQUE', 'UPI']),
        createdAt: now,
        updatedAt: now,
        isArchived: false
      });
    }
  }

  // 8. Generate Documents
  const documents = [];
  const documentCategories = ['Tax Returns', 'Audit Reports', 'Financial Statements', 'Invoices', 'Contracts'];
  const totalDocuments = 80;
  for (let i = 0; i < totalDocuments; i++) {
    const client = randomItem(clients);
    const category = randomItem(documentCategories);
    const staff = randomItem(employees);
    
    documents.push({
      id: generateId('doc', i + 1),
      documentNumber: `DOC-${1000 + i}`,
      documentName: `${category} - ${client.clientName}.pdf`,
      clientId: client.id,
      category: category,
      version: 1,
      uploadedBy: staff.id,
      fileSize: randomInt(500, 5000) * 1024, // Size in bytes
      fileType: 'application/pdf',
      fileUrl: '/dummy-url',
      status: 'APPROVED',
      createdAt: new Date(new Date(now).getTime() - randomInt(1, 100) * 86400000).toISOString(),
      updatedAt: now,
      isArchived: false
    });
  }

  // Generate Activity Logs
  const activity_logs = [];
  for (let i = 0; i < 50; i++) {
    activity_logs.push({
      id: generateId('log', i + 1),
      action: 'Create',
      module: randomItem(['Tasks', 'Clients', 'Invoices']),
      entityType: 'Record',
      entityId: generateId('ent', i),
      description: `Generated record ${i}`,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    });
  }

  // Map employees to users for authentication
  const users = employees.map(emp => ({
    id: emp.id,
    email: emp.email,
    firstName: emp.firstName,
    lastName: emp.lastName,
    role: emp.roleName || 'Employee',
    hierarchyLevel: roles.find(r => r.name === emp.roleName)?.hierarchyLevel || 7
  }));
  
  // Add Super Admin explicitly
  users.push({
    id: '1',
    email: 'admin@demo.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'Super Admin',
    hierarchyLevel: 1
  });

  const mockDatabase = {
    departments,
    roles,
    designations,
    employees,
    clients,
    tasks,
    invoices,
    payments,
    documents,
    corestack_notifications: [],
    corestack_notification_preferences: [],
    corestack_notification_templates: [],
    corestack_reminders: [],
    corestack_communication_logs: [],
    corestack_settings: {
      firmName: 'CoreStack & Co.',
      financialYear: '2023-2024',
      timezone: 'Asia/Kolkata'
    },
    activity_logs,
    users
  };

  await dataManagementService.importData(JSON.stringify(mockDatabase));
};
