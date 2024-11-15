import express from 'express';

export default function(studentsDb) {
  const router = express.Router();

  // Rota para obter todos os alunos
  router.get('/', async (req, res) => {
    try {
      await studentsDb.read();
      res.json(studentsDb.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Rota para adicionar um novo aluno
router.post('/', async (req, res) => {
  try {
    await studentsDb.read();

    // Garante que o ID seja atribuído corretamente
    const newStudentId = studentsDb.data.students.length > 0
      ? Math.max(...studentsDb.data.students.map(s => s.id)) + 1
      : 1;

    // Verifica se o ID gerado é um número válido
    if (isNaN(newStudentId)) {
      return res.status(400).json({ message: 'Invalid student ID generation' });
    }

    const newStudent = {
      id: newStudentId, // Atribui o ID único
      ...req.body // Espalha os dados do novo aluno recebidos
    };

    studentsDb.data.students.push(newStudent);
    await studentsDb.write(); // Escreve de volta no banco de dados
    console.log('New student added:', newStudent); // Log da criação do aluno
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



  // Rota para obter um aluno específico
  router.get('/:id', async (req, res) => {
    try {
      await studentsDb.read();
      const student = studentsDb.data.students.find(s => s.id === parseInt(req.params.id));
      if (student) {
        res.json(student);
      } else {
        res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Rota para atualizar um aluno específico
  router.put('/:id', async (req, res) => {
    try {
      await studentsDb.read();
      const index = studentsDb.data.students.findIndex(s => s.id === parseInt(req.params.id));
      if (index !== -1) {
        studentsDb.data.students[index] = { ...studentsDb.data.students[index], ...req.body };
        await studentsDb.write();
        res.json(studentsDb.data.students[index]);
      } else {
        res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Rota para eliminar um aluno específico
  
router.delete('/:id', async (req, res) => {
  try {
    await studentsDb.read(); // Lê o banco de dados
    const index = studentsDb.data.students.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index !== -1) {
      // Remove o aluno do array de estudantes
      const deletedStudent = studentsDb.data.students.splice(index, 1); 
      await studentsDb.write(); // Escreve as mudanças no banco de dados
      
      // Responde com o aluno deletado
      res.json(deletedStudent);
    } else {
      // Caso o aluno não seja encontrado
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  return router;
}