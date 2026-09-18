const fs = require('fs');
let file = 'src/pages/Housekeeping/RoomsAndCleaning.jsx';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add whitespace-nowrap back to table (I previously removed it)
    content = content.replace(/<table className="w-full text-left">/g, '<table className="w-full text-left whitespace-nowrap">');
    // Just in case it's still there or slightly different
    if (!content.includes('whitespace-nowrap')) {
         content = content.replace(/<table className="w-full text-left(.*?)">/g, '<table className="w-full text-left whitespace-nowrap">');
    }

    // 2. Change state keys
    content = content.replace(/'Scheduled Date': true, 'Scheduled Time': true/g, "'Date': true");

    // 3. Update export logic
    // CSV
    content = content.replace(/else if \(col === 'Scheduled Date'\) val = r\.scheduledDate;\s*else if \(col === 'Scheduled Time'\) val = r\.scheduledTime;/g, 
                              "else if (col === 'Date') val = r.scheduledDate + ' ' + r.scheduledTime;");
                              
    // 4. Replace TH
    let thRegex = /\{visibleColumns\['Scheduled Date'\] && <th className="py-4 px-2 text-\[12px\] font-bold text-gray-700">Date<\/th>\}\s*\{visibleColumns\['Scheduled Time'\] && <th className="py-4 px-2 text-\[12px\] font-bold text-gray-700">Time<\/th>\}/;
    content = content.replace(thRegex, '{visibleColumns[\'Date\'] && <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Date</th>}');

    // 5. Replace TD
    let tdRegex = /\{visibleColumns\['Scheduled Date'\] && \(\s*<td className="py-3 px-2 text-\[12px\] text-gray-600 flex items-center gap-1\.5">\s*<CalendarTodayOutlined sx=\{\{ fontSize: 14 \}\} className="text-gray-500" \/>\s*\{record\.scheduledDate\}\s*<\/td>\s*\)\}\s*\{visibleColumns\['Scheduled Time'\] && <td className="py-3 px-2 text-\[12px\] text-gray-600">\{record\.scheduledTime\}<\/td>\}/;
    
    let newTd = "{visibleColumns['Date'] && (\n" +
                "  <td className=\"py-3 px-2 text-[12px] text-gray-600\">\n" +
                "    <div className=\"flex items-center gap-1.5 whitespace-nowrap\">\n" +
                "      <CalendarTodayOutlined sx={{ fontSize: 14 }} className=\"text-gray-500\" />\n" +
                "      <span>{record.scheduledDate} <span className=\"text-gray-400 mx-1\">|</span> {record.scheduledTime}</span>\n" +
                "    </div>\n" +
                "  </td>\n" +
                ")}";
    content = content.replace(tdRegex, newTd);

    fs.writeFileSync(file, content);
    console.log("Updated RoomsAndCleaning.jsx Date columns!");
}
