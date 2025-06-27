import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  columns: { title: string; tasks: { id: number; name: string; image: string | null }[] }[] = [
    {
      title: 'To Do',
      tasks: [
        { id: 1, name: 'Design homepage', image: 'https://images.pexels.com/photos/30405409/pexels-photo-30405409/free-photo-of-skiers-enjoy-snowy-landscape-under-clear-sky.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' },
        { id: 2, name: 'Fix login bug', image: 'https://images.pexels.com/photos/899757/pexels-photo-899757.jpeg?auto=compress&cs=tinysrgb&w=600' }
      ]
    },
    {
      title: 'To Do',
      tasks: [
        { id: 1, name: 'Design homepage', image: 'https://images.pexels.com/photos/30405409/pexels-photo-30405409/free-photo-of-skiers-enjoy-snowy-landscape-under-clear-sky.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' },
        { id: 2, name: 'Fix login bug', image: 'https://images.pexels.com/photos/899757/pexels-photo-899757.jpeg?auto=compress&cs=tinysrgb&w=600' }
      ]
    }, {
      title: 'To Do',
      tasks: [
        { id: 1, name: 'Design homepage', image: 'https://images.pexels.com/photos/30405409/pexels-photo-30405409/free-photo-of-skiers-enjoy-snowy-landscape-under-clear-sky.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' },
        { id: 2, name: 'Fix login bug', image: 'https://images.pexels.com/photos/899757/pexels-photo-899757.jpeg?auto=compress&cs=tinysrgb&w=600' }
      ]
    }, {
      title: 'To Do',
      tasks: [
        { id: 1, name: 'Design homepage', image: 'https://images.pexels.com/photos/30405409/pexels-photo-30405409/free-photo-of-skiers-enjoy-snowy-landscape-under-clear-sky.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load' },
        { id: 2, name: 'Fix login bug', image: 'https://images.pexels.com/photos/899757/pexels-photo-899757.jpeg?auto=compress&cs=tinysrgb&w=600' }
      ]
    },
    {
      title: 'In Progress',
      tasks: [
        { id: 3, name: 'Develop API endpoints', image: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=600' }
      ]
    },
    {
      title: 'Done',
      tasks: [
        { id: 4, name: 'Set up database', image: "https://images.pexels.com/photos/214576/pexels-photo-214576.jpeg?auto=compress&cs=tinysrgb&w=600" }
      ]
    }
  ];

  get connectedDropLists() {
    return this.columns.map((_, index) => `cdk-drop-list-${index}`);
  }

  onTaskDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  addTask(columnIndex: number) {
    const taskName = prompt('Enter task name:');
    const taskImage = prompt('Enter image URL (optional):');
    if (taskName) {
      this.columns[columnIndex].tasks.push({
        id: Date.now(),
        name: taskName,
        image: taskImage || null
      });
    }
  }

  deleteTask(columnIndex: number, taskIndex: number) {
    const confirmDelete = confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      this.columns[columnIndex].tasks.splice(taskIndex, 1);
    }
  }

  viewDetails(task: { id: number; name: string; image: string | null }) {
    alert(`Task Details:\nName: ${task.name}\nImage: ${task.image || 'None'}`);
  }

}

