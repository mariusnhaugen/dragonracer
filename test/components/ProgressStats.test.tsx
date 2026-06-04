import { render, screen } from '@testing-library/react';
import { ProgressStats } from '../../src/components/ProgressStats';
import { tasksFixture } from '../../src/mocks/handlers';

it('shows completed count, tasks and percentage', () => {
    render(<ProgressStats tasks={tasksFixture} completedIds={new Set([1])} />)
    expect(screen.getByText("1/3 tasks (33%)")).toBeTruthy();
    expect(screen.getByText("10 / 120 pts")).toBeTruthy();
});

it('handles empty input with a fallback', () => {
    render(<ProgressStats tasks={[]} completedIds={new Set()} />)
    expect(screen.getByText("0/0 tasks (0%)"))
}); 
