const fs = require('fs');

const missingIcons = {
  'src/pages/HR/LeaveRequests/LeaveRequests.jsx': ['HomeOutlinedIcon', 'SearchIcon', 'DeleteOutlinedIcon', 'FilterListIcon', 'AddIcon', 'RefreshIcon', 'TableChartIcon', 'PictureAsPdfIcon', 'CalendarTodayIcon', 'EditIcon', 'ChevronLeftIcon', 'ChevronRightIcon', 'PersonOutlinedIcon', 'CloseIcon'],
  'src/pages/HR/Salary/EmployeeSalary.jsx': ['MoreVertIcon', 'TotalIcon', 'MoneyIcon', 'PaidIcon', 'PendingIcon', 'SearchIcon'],
  'src/pages/HR/Staff/AddStaff.jsx': ['PersonOutlinedIcon', 'TagIcon', 'AutorenewIcon', 'WcIcon', 'CalendarTodayIcon', 'PublicIcon', 'FavoriteBorderIcon', 'TranslateIcon', 'WorkHistoryOutlinedIcon', 'BusinessIcon', 'BadgeOutlinedIcon', 'AccessTimeIcon', 'AttachMoneyIcon', 'VerifiedOutlinedIcon', 'SupervisorAccountOutlinedIcon', 'PhoneOutlinedIcon', 'SmartphoneOutlinedIcon', 'MailOutlinedIcon', 'HomeOutlinedIcon', 'SchoolOutlinedIcon', 'TrendingUpIcon', 'ContactPhoneOutlinedIcon', 'GroupOutlinedIcon', 'DescriptionOutlinedIcon', 'CloudUploadIcon', 'InsertDriveFileOutlinedIcon', 'DeleteOutlineIcon', 'PersonAddOutlinedIcon', 'CloseIcon'],
  'src/pages/HR/Staff/AllStaff.jsx': ['PhoneOutlinedIcon', 'MailOutlinedIcon', 'CalendarTodayOutlinedIcon', 'LocationOnOutlinedIcon', 'EditIcon', 'SearchIcon', 'DeleteOutlineIcon', 'FilterListIcon', 'AddCircleOutlineIcon', 'RefreshIcon', 'CalculateIcon', 'PictureAsPdfIcon'],
  'src/pages/Reports/ExpenseManagement.jsx': ['MoreVertIcon', 'AddIcon', 'TotalExpenseIcon', 'MonthIcon', 'PendingIcon', 'PaidIcon', 'SearchIcon'],
  'src/pages/Restaurant/components/CreateOrderModal.jsx': ['Bed', 'Close', 'Search', 'Add', 'Remove', 'Badge', 'CheckCircle'],
  'src/pages/Restaurant/components/MenuItemCard.jsx': ['ShoppingCart', 'Remove', 'Add'],
  'src/pages/Restaurant/components/MenuItemModal.jsx': ['Restaurant', 'Close'],
  'src/pages/Restaurant/components/OrderCard.jsx': ['Bed', 'AttachMoney', 'CreditCard'],
  'src/pages/Restaurant/components/OrderPanel.jsx': ['Receipt', 'Delete', 'AttachMoney', 'CreditCard', 'Print'],
  'src/pages/Restaurant/components/ViewItemModal.jsx': ['Edit', 'Close', 'FormatListBulleted', 'CalendarToday', 'LabelImportant'],
  'src/pages/Restaurant/tabs/MenuTab.jsx': ['Delete', 'Search', 'FilterList', 'ContentCopy', 'PictureAsPdf', 'CheckBox', 'IndeterminateCheckBox', 'CheckBoxOutlineBlank', 'CalendarToday', 'Edit'],
  'src/pages/Restaurant/tabs/OrdersTab.jsx': ['Search', 'FilterList', 'AddCircleOutlined', 'ContentCopy', 'PictureAsPdf', 'Receipt', 'Bed', 'AttachMoney', 'CreditCard', 'AccessTime', 'MoreVert', 'Edit', 'PlayCircle', 'CheckCircle', 'Cancel', 'Delete']
};

const customMap = {
  'TotalIcon': 'Functions',
  'TotalExpenseIcon': 'Functions',
  'MoneyIcon': 'AttachMoney',
  'PaidIcon': 'CheckCircle',
  'PendingIcon': 'HourglassEmpty',
  'MonthIcon': 'CalendarMonth',
};

for (const [file, icons] of Object.entries(missingIcons)) {
  let content = fs.readFileSync(file, 'utf8');
  let imports = '';
  for (const icon of icons) {
    if (customMap[icon]) {
      imports += `import ${icon} from '@mui/icons-material/${customMap[icon]}';\n`;
    } else if (icon.endsWith('Icon')) {
      const base = icon.substring(0, icon.length - 4);
      imports += `import ${icon} from '@mui/icons-material/${base}';\n`;
    } else {
      imports += `import ${icon} from '@mui/icons-material/${icon}';\n`;
    }
  }
  
  // insert imports after the last import statement or at the top
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf('\\n', lastImportIndex);
    content = content.substring(0, endOfImport + 1) + imports + content.substring(endOfImport + 1);
  } else {
    content = imports + '\\n' + content;
  }
  fs.writeFileSync(file, content);
}
console.log('Icons fixed!');
