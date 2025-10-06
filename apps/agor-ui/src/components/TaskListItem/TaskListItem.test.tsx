import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockTask001, mockTask002 } from '../../mocks/tasks';
import TaskListItem from './TaskListItem';

describe('TaskListItem', () => {
  it('renders completed task', () => {
    render(<TaskListItem task={mockTask001} />);
    expect(screen.getByText('Design JWT authentication flow')).toBeInTheDocument();
  });

  it('renders running task', () => {
    render(<TaskListItem task={mockTask002} />);
    expect(screen.getByText('Implement JWT auth endpoints')).toBeInTheDocument();
  });

  it('shows message count', () => {
    render(<TaskListItem task={mockTask001} />);
    expect(screen.getByText(/13 msgs/)).toBeInTheDocument();
  });

  it('shows report indicator when report exists', () => {
    render(<TaskListItem task={mockTask001} />);
    expect(screen.getByText('report')).toBeInTheDocument();
  });
});
