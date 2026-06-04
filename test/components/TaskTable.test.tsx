import { render, screen, within } from '@testing-library/react';
import { TaskTable } from '../../src/components/TaskTable';
import { tasksFixture } from '../../src/mocks/handlers';

let noopHandlers = {
    onToggleComplete: vi.fn(),
    onToggleSelect: vi.fn(),
    onAddTag: vi.fn(),
    onRemoveTag: vi.fn(),
}

let defaultProps = {
    selectMode: false,
    tagMode: false,
    completedIds: new Set<number>(),
    selectedIds: new Set<number>(),
    taskTagsMap: {},
    allTags: [],
}

it('Shows the same amount of rows as tasks passed', () => {
    render(<TaskTable tasks={tasksFixture} {...defaultProps}{...noopHandlers} />)
    expect(screen.getByText("Kill a goblin")).toBeTruthy();
    const [_, tbody] = screen.getAllByRole('rowgroup');
    expect(within(tbody).getAllByRole('row')).toHaveLength(tasksFixture.length);
});

it('shows the empty message when there are no tasks', () => {

    render(<TaskTable tasks={[]} emptyMessage='No tasks' {...defaultProps} {...noopHandlers} />);
    expect(screen.getByText('No tasks')).toBeTruthy();
});

