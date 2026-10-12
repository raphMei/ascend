import { render, screen } from '@testing-library/react';
import { DayHero } from '@/components/habits/DayHero';

const base = { pct: 40, doneMin: 90, plannedMin: 240, doneCount: 3, total: 7, workMin: 450, tripMin: 90, streak: 6, calm: false };

describe('héros du jour', () => {
  it('anneau accessible, tâches faites et série', () => {
    render(<DayHero {...base} />);
    expect(screen.getByRole('img', { name: '40 % de la journée faite' })).toBeInTheDocument();
    expect(screen.getByText('3 / 7 faites')).toBeInTheDocument();
    expect(screen.getByText(/6 jours d'affilée/)).toBeInTheDocument();
  });
  it('message direct selon ce qu\'il reste', () => {
    const { rerender } = render(<DayHero {...base} />);
    expect(screen.getByText('Encore 4. On y va.')).toBeInTheDocument();
    rerender(<DayHero {...base} doneCount={5} />);
    expect(screen.getByText('Plus que 2. Tu y es.')).toBeInTheDocument();
    rerender(<DayHero {...base} doneCount={7} pct={100} />);
    expect(screen.getByText('Journée bouclée. Bravo.')).toBeInTheDocument();
  });
  it('le soir, le ton se calme', () => {
    render(<DayHero {...base} calm />);
    expect(screen.getByText('Encore 4. Finis tranquille.')).toBeInTheDocument();
  });
  it('sans série : pas de pastille', () => {
    render(<DayHero {...base} streak={0} />);
    expect(screen.queryByText(/d'affilée/)).not.toBeInTheDocument();
  });
});
