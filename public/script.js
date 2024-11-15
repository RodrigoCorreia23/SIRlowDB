let students = [];
let currentEditingStudent = null;

document.addEventListener('DOMContentLoaded', function() {
  fetchStudents();
});

function fetchStudents() {
  fetch('/students')
    .then(response => response.json())
    .then(data => {
      students = data;
      renderStudents();
    })
    .catch(error => console.error('Error fetching students:', error));
}

function renderStudents() {
  const tableBody = document.querySelector('#studentsTable tbody');
  tableBody.innerHTML = ''; // Clear existing rows

  students.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.course}</td>
      <td>${student.year}</td>
      <td>
        <button onclick="editStudent(${student.id})">Edit</button>
        <button onclick="deleteStudent(${student.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function createNewStudent() {
  const name = document.getElementById('newName').value;
  const course = document.getElementById('newCourse').value;
  const year = document.getElementById('newYear').value;
  const id = students.length > 0 ? students[students.length - 1].id + 1 : 1;

  const newStudent = { id,name, course, year };

  fetch('/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newStudent)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Response data:', data); // Log a resposta completa do servidor
    if (data.id !== undefined) {
      students.push(data); // Adiciona o aluno com o id gerado ao array de estudantes
      renderStudents(); // Re-renderiza a tabela de alunos
    } else {
      console.error('Failed to create student, ID is undefined');
    }
  })
  .catch(error => console.error('Error creating student:', error));
}



function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (student) {
    currentEditingStudent = student;
    document.getElementById('editName').value = student.name;
    document.getElementById('editCourse').value = student.course;
    document.getElementById('editYear').value = student.year;

    document.querySelector('.edit-item-form').style.display = 'block';
  }
}

function updateStudent() {
  const updatedStudent = {
    name: document.getElementById('editName').value,
    course: document.getElementById('editCourse').value,
    year: document.getElementById('editYear').value
  };

  fetch(`/students/${currentEditingStudent.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedStudent)
  })
  .then(response => response.json())
  .then(data => {
    // Update the student in the list
    const index = students.findIndex(s => s.id === currentEditingStudent.id);
    if (index !== -1) {
      students[index] = data;
      renderStudents(); // Re-render the table
      cancelEdit(); // Hide the edit form
    }
  })
  .catch(error => console.error('Error updating student:', error));
}

function cancelEdit() {
  document.querySelector('.edit-item-form').style.display = 'none';
  currentEditingStudent = null;
}

function deleteStudent(id) {
  fetch(`/students/${id}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    students = students.filter(s => s.id !== id);
    renderStudents(); // Re-render the table
  })
  .catch(error => console.error('Error deleting student:', error));
}
