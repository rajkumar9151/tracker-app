import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

// Helper to get file path
function getFilePath(projectName) {
  const dataDir = process.env.DATA_DIR || process.cwd();
  return path.join(dataDir, `${projectName}_tracker.xlsx`);
}

export async function getProjects() {
  const dataDir = process.env.DATA_DIR || process.cwd();
  const files = fs.readdirSync(dataDir);
  const projects = files
    .filter(file => file.endsWith('_tracker.xlsx') && !file.startsWith('~$'))
    .map(file => file.replace('_tracker.xlsx', ''));
  return projects;
}

export async function initializeExcel(projectName, customColumns = []) {
  const filePath = getFilePath(projectName);
  if (fs.existsSync(filePath)) {
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tracker App';
  workbook.created = new Date();

  const tasksSheet = workbook.addWorksheet('Tasks');
  
  // Default columns + any custom columns passed during project creation
  const baseColumns = ['ID', 'Task Name', 'Owner', 'Status', 'Priority', 'Created Date', 'Next Update Due'];
  const allColumns = [...baseColumns, ...customColumns];
  
  tasksSheet.columns = allColumns.map(col => ({
    header: col,
    key: col,
    width: col === 'Task Name' ? 40 : 20
  }));

  const updatesSheet = workbook.addWorksheet('Updates');
  updatesSheet.columns = [
    { header: 'Update ID', key: 'updateId', width: 25 },
    { header: 'Task ID', key: 'taskId', width: 25 },
    { header: 'Task Name', key: 'taskName', width: 40 },
    { header: 'Week Number', key: 'weekNumber', width: 15 },
    { header: 'Update Date', key: 'updateDate', width: 25 },
    { header: 'Description', key: 'description', width: 80 },
  ];

  await workbook.xlsx.writeFile(filePath);
}

export async function getTrackerData(projectName) {
  const filePath = getFilePath(projectName);
  if (!fs.existsSync(filePath)) {
    throw new Error('Project not found');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const tasksSheet = workbook.getWorksheet('Tasks');
  const updatesSheet = workbook.getWorksheet('Updates');

  // Read columns dynamically from row 1
  const columns = [];
  tasksSheet.getRow(1).eachCell((cell) => {
    columns.push(cell.value);
  });

  // Seamless migration for existing projects
  let columnAdded = false;
  if (!columns.includes('Next Update Due')) {
    columns.push('Next Update Due');
    tasksSheet.getRow(1).getCell(columns.length).value = 'Next Update Due';
    tasksSheet.getRow(1).commit();
    columnAdded = true;
  }

  const tasks = [];
  tasksSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    const taskObj = {};
    columns.forEach((colName, index) => {
      taskObj[colName] = row.getCell(index + 1).value;
    });
    tasks.push(taskObj);
  });

  if (columnAdded) {
    await workbook.xlsx.writeFile(filePath);
  }

  const updateColumns = [];
  updatesSheet.getRow(1).eachCell((cell) => {
    updateColumns.push(cell.value);
  });

  const updates = [];
  updatesSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    const updateObj = {};
    updateColumns.forEach((colName, index) => {
      updateObj[colName] = row.getCell(index + 1).value;
    });
    // For backward compatibility ensure basic fields are explicitly mapped 
    // if we ever rename them or want guarantees
    if (updateObj['Update ID']) updateObj.updateId = updateObj['Update ID'];
    if (updateObj['Task ID']) updateObj.taskId = updateObj['Task ID'];
    if (updateObj['Task Name']) updateObj.taskName = updateObj['Task Name'];
    if (updateObj['Week Number']) updateObj.weekNumber = updateObj['Week Number'];
    if (updateObj['Update Date']) updateObj.updateDate = updateObj['Update Date'];
    if (updateObj['Description']) updateObj.description = updateObj['Description'];
    
    // Also map the internal keys back to the objects so UI has access to raw keys
    updateObj.updateId = updateObj.updateId || updateObj['Update ID'];
    updateObj.taskId = updateObj.taskId || updateObj['Task ID'];
    
    updates.push(updateObj);
  });

  return { columns, updateColumns, tasks, updates };
}

export async function addTask(projectName, taskData) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const tasksSheet = workbook.getWorksheet('Tasks');

  const columns = [];
  tasksSheet.getRow(1).eachCell((cell) => {
    columns.push(cell.value);
  });

  // Map the object data to an array in the exact column order
  const rowArray = columns.map(colName => taskData[colName] || '');
  
  tasksSheet.addRow(rowArray);
  await workbook.xlsx.writeFile(filePath);
}

export async function addUpdate(projectName, updateData) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const updatesSheet = workbook.getWorksheet('Updates');

  const columns = [];
  updatesSheet.getRow(1).eachCell((cell) => {
    columns.push(cell.value);
  });

  // Map the object data to an array in the exact column order
  const rowArray = columns.map(colName => {
    // Map standard fields to their internal keys if passed
    if (colName === 'Update ID') return updateData.updateId || '';
    if (colName === 'Task ID') return updateData.taskId || '';
    if (colName === 'Task Name') return updateData.taskName || '';
    if (colName === 'Week Number') return updateData.weekNumber || '';
    if (colName === 'Update Date') return updateData.updateDate || '';
    if (colName === 'Description') return updateData.description || '';
    return updateData[colName] !== undefined ? updateData[colName] : '';
  });

  updatesSheet.addRow(rowArray);

  await workbook.xlsx.writeFile(filePath);
}

export async function addColumnToExcel(projectName, columnName, targetSheet = 'Tasks') {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet(targetSheet);
  
  const row1 = sheet.getRow(1);
  let maxCol = 1;
  row1.eachCell((cell, colNumber) => {
    maxCol = colNumber;
  });
  
  row1.getCell(maxCol + 1).value = columnName;
  row1.commit();
  
  await workbook.xlsx.writeFile(filePath);
}

export async function updateTask(projectName, taskData) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const tasksSheet = workbook.getWorksheet('Tasks');

  const columns = [];
  tasksSheet.getRow(1).eachCell((cell) => {
    columns.push(cell.value);
  });

  const idColIndex = columns.indexOf('ID') + 1;
  let targetRowNumber = -1;
  
  tasksSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(idColIndex).value === taskData['ID']) {
      targetRowNumber = rowNumber;
    }
  });

  if (targetRowNumber !== -1) {
    const row = tasksSheet.getRow(targetRowNumber);
    columns.forEach((colName, index) => {
      row.getCell(index + 1).value = taskData[colName] !== undefined ? taskData[colName] : '';
    });
    row.commit();
    await workbook.xlsx.writeFile(filePath);
  } else {
    throw new Error('Task not found');
  }
}

export async function deleteTask(projectName, taskId) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const tasksSheet = workbook.getWorksheet('Tasks');
  const updatesSheet = workbook.getWorksheet('Updates');

  // Delete from Tasks sheet
  const columns = [];
  tasksSheet.getRow(1).eachCell((cell) => columns.push(cell.value));
  const idColIndex = columns.indexOf('ID') + 1;
  
  let taskRowNumber = -1;
  tasksSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && row.getCell(idColIndex).value === taskId) {
      taskRowNumber = rowNumber;
    }
  });

  if (taskRowNumber !== -1) {
    tasksSheet.spliceRows(taskRowNumber, 1);
  }

  // Delete from Updates sheet (reverse order to not mess up indices)
  const rowsToDelete = [];
  updatesSheet.eachRow((row, rowNumber) => {
    // taskId is the 2nd column in Updates sheet
    if (rowNumber > 1 && row.getCell(2).value === taskId) {
      rowsToDelete.push(rowNumber);
    }
  });

  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    updatesSheet.spliceRows(rowsToDelete[i], 1);
  }

  await workbook.xlsx.writeFile(filePath);
}

export async function getProjectsWithStats() {
  const dataDir = process.env.DATA_DIR || process.cwd();
  const files = fs.readdirSync(dataDir);
  const projectNames = files
    .filter(file => file.endsWith('_tracker.xlsx') && !file.startsWith('~$'))
    .map(file => file.replace('_tracker.xlsx', ''));
    
  const projects = [];
  
  for (const name of projectNames) {
    const filePath = getFilePath(name);
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const tasksSheet = workbook.getWorksheet('Tasks');
      
      const columns = [];
      tasksSheet.getRow(1).eachCell(cell => columns.push(cell.value));
      const statusColIndex = columns.indexOf('Status') + 1;
      
      let total = 0;
      let todo = 0;
      let inProgress = 0;
      let done = 0;
      
      tasksSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        total++;
        const status = row.getCell(statusColIndex).value;
        if (status === 'To Do') todo++;
        else if (status === 'In Progress') inProgress++;
        else if (status === 'Done') done++;
      });
      
      projects.push({
        name,
        stats: { total, todo, inProgress, done }
      });
    } catch (error) {
      console.error(`Error reading stats for ${name}:`, error);
      projects.push({ name, stats: { total: 0, todo: 0, inProgress: 0, done: 0 } });
    }
  }
  
  return projects;
}

export async function deleteProject(projectName) {
  const filePath = getFilePath(projectName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  const metaPath = path.join(process.cwd(), `${projectName}_metadata.json`);
  if (fs.existsSync(metaPath)) {
    fs.unlinkSync(metaPath);
  }
}

export async function editUpdate(projectName, updateData) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const updatesSheet = workbook.getWorksheet('Updates');

  const columns = [];
  updatesSheet.getRow(1).eachCell((cell) => {
    columns.push(cell.value);
  });

  let targetRowNumber = -1;
  const idColIndex = columns.indexOf('Update ID') + 1;
  
  updatesSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(idColIndex).value === updateData.updateId) {
      targetRowNumber = rowNumber;
    }
  });

  if (targetRowNumber !== -1) {
    const row = updatesSheet.getRow(targetRowNumber);
    columns.forEach((colName, index) => {
      let val = updateData[colName];
      // Map standard keys back from updateData
      if (colName === 'Week Number' && updateData.weekNumber !== undefined) val = updateData.weekNumber;
      if (colName === 'Update Date' && updateData.updateDate !== undefined) val = updateData.updateDate;
      if (colName === 'Description' && updateData.description !== undefined) val = updateData.description;
      
      if (val !== undefined) {
        row.getCell(index + 1).value = val;
      }
    });
    row.commit();
    await workbook.xlsx.writeFile(filePath);
  } else {
    throw new Error('Update not found');
  }
}

export async function deleteUpdate(projectName, updateId) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const updatesSheet = workbook.getWorksheet('Updates');

  let targetRowNumber = -1;
  updatesSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === updateId) {
      targetRowNumber = rowNumber;
    }
  });

  if (targetRowNumber !== -1) {
    updatesSheet.spliceRows(targetRowNumber, 1);
    await workbook.xlsx.writeFile(filePath);
  } else {
    throw new Error('Update not found');
  }
}

export async function getDueTasks() {
  const files = fs.readdirSync(process.cwd());
  const projectNames = files
    .filter(file => file.endsWith('_tracker.xlsx') && !file.startsWith('~$'))
    .map(file => file.replace('_tracker.xlsx', ''));
    
  const dueTasks = [];
  const today = new Date().setHours(0, 0, 0, 0); // Start of today
  
  for (const name of projectNames) {
    const filePath = getFilePath(name);
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const tasksSheet = workbook.getWorksheet('Tasks');
      
      const columns = [];
      tasksSheet.getRow(1).eachCell(cell => columns.push(cell.value));
      
      // If project doesn't have Next Update Due, skip for now
      // (The user can add it via UI or we handle it lazily)
      if (!columns.includes('Next Update Due')) continue;

      const dueDateColIndex = columns.indexOf('Next Update Due') + 1;
      const statusColIndex = columns.indexOf('Status') + 1;
      
      tasksSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        const status = row.getCell(statusColIndex).value;
        if (status === 'Done') return; // Done tasks aren't due
        
        const dueDateVal = row.getCell(dueDateColIndex).value;
        if (dueDateVal) {
          const dueDate = new Date(dueDateVal).getTime();
          if (dueDate <= today) {
            // It's due! Reconstruct the task object
            const taskObj = { projectName: name };
            columns.forEach((colName, index) => {
              taskObj[colName] = row.getCell(index + 1).value;
            });
            dueTasks.push(taskObj);
          }
        }
      });
    } catch (error) {
      console.error(`Error reading due tasks for ${name}:`, error);
    }
  }
  
  // Sort dueTasks by due date ascending
  dueTasks.sort((a, b) => new Date(a['Next Update Due']).getTime() - new Date(b['Next Update Due']).getTime());
  
  return dueTasks;
}

export async function snoozeTask(projectName, taskId, snoozeDays = 7) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const tasksSheet = workbook.getWorksheet('Tasks');

  const columns = [];
  tasksSheet.getRow(1).eachCell(cell => columns.push(cell.value));
  
  if (!columns.includes('Next Update Due')) {
    // Column doesn't exist, can't snooze
    return;
  }

  const idColIndex = columns.indexOf('ID') + 1;
  const dueDateColIndex = columns.indexOf('Next Update Due') + 1;

  let targetRowNumber = -1;
  tasksSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(idColIndex).value === taskId) {
      targetRowNumber = rowNumber;
    }
  });

  if (targetRowNumber !== -1) {
    const row = tasksSheet.getRow(targetRowNumber);
    let currentDue = row.getCell(dueDateColIndex).value;
    if (!currentDue) currentDue = new Date().toISOString();
    
    // Quick helper inline for pushing dates
    const date = new Date(currentDue);
    date.setDate(date.getDate() + snoozeDays);
    const day = date.getDay();
    if (day === 6) date.setDate(date.getDate() + 2); // Sat to Mon
    if (day === 0) date.setDate(date.getDate() + 1); // Sun to Mon
    
    // Format YYYY-MM-DD
    const newDateStr = date.toISOString().split('T')[0];
    row.getCell(dueDateColIndex).value = newDateStr;
    row.commit();
    
    await workbook.xlsx.writeFile(filePath);
  }
}

export async function closeTask(projectName, taskId) {
  const filePath = getFilePath(projectName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const tasksSheet = workbook.getWorksheet('Tasks');

  const columns = [];
  tasksSheet.getRow(1).eachCell(cell => columns.push(cell.value));
  
  const idColIndex = columns.indexOf('ID') + 1;
  const statusColIndex = columns.indexOf('Status') + 1;

  let targetRowNumber = -1;
  tasksSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(idColIndex).value === taskId) {
      targetRowNumber = rowNumber;
    }
  });

  if (targetRowNumber !== -1) {
    const row = tasksSheet.getRow(targetRowNumber);
    row.getCell(statusColIndex).value = 'Done';
    row.commit();
    await workbook.xlsx.writeFile(filePath);
  }
}
