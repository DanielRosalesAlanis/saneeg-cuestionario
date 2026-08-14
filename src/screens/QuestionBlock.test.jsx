import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuestionBlock } from './QuestionBlock';

const commonProps = {
  pctStart: 0,
  pctEnd: 100,
  blockIndex: 1,
  totalBlocks: 1,
  onBack: vi.fn(),
};

describe('QuestionBlock', () => {
  it('impide avanzar con una edad fuera del umbral y acepta 10', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    let data = {};
    const setData = patch => { data = { ...data, ...patch }; rerenderView(); };
    const question = { id: 'b1_4', text: 'Edad', type: 'text', inputMode: 'numeric', min: 10, max: 100 };
    let rerenderView;
    const view = render(<QuestionBlock {...commonProps} questions={[question]} data={data} setData={setData} onFinish={onFinish} />);
    rerenderView = () => view.rerender(<QuestionBlock {...commonProps} questions={[question]} data={data} setData={setData} onFinish={onFinish} />);

    const input = screen.getByRole('spinbutton');
    await user.type(input, '9');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await user.clear(input);
    await user.type(input, '10');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('mantiene la opción exclusiva sin combinarla con otras', async () => {
    const user = userEvent.setup();
    let data = {};
    const question = { id: 'b1_11', text: 'Diagnósticos', type: 'multi', opts: ['Ninguno', 'Ansiedad'] };
    let rerenderView;
    const setData = patch => { data = { ...data, ...patch }; rerenderView(); };
    const view = render(<QuestionBlock {...commonProps} questions={[question]} data={data} setData={setData} onFinish={vi.fn()} />);
    rerenderView = () => view.rerender(<QuestionBlock {...commonProps} questions={[question]} data={data} setData={setData} onFinish={vi.fn()} />);

    await user.click(screen.getByRole('checkbox', { name: 'Ninguno' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ansiedad' }));
    expect(data.b1_11).toEqual(['Ansiedad']);
  });

  it('cubre selección simple, navegación hacia atrás y escala', async () => {
    const user = userEvent.setup();
    let data = {};
    let rerenderView;
    const back = vi.fn();
    const finish = vi.fn();
    const questions = [
      { id: 'q1', text: 'Simple', type: 'single', opts: ['Sí', 'No'] },
      { id: 'q2', text: 'Escala', type: 'slider', min: 1, max: 5 },
    ];
    const setData = patch => { data = { ...data, ...patch }; rerenderView(); };
    const view = render(<QuestionBlock {...commonProps} questions={questions} data={data} setData={setData} onFinish={finish} onBack={back} />);
    rerenderView = () => view.rerender(<QuestionBlock {...commonProps} questions={questions} data={data} setData={setData} onFinish={finish} onBack={back} />);
    await user.click(screen.getByRole('radio', { name: 'Sí' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Regresar' }));
    expect(screen.getByRole('heading', { name: 'Simple' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Valor 5' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(finish).toHaveBeenCalledOnce();
  });

  it('quita una selección múltiple al pulsarla otra vez', async () => {
    const user = userEvent.setup();
    let data = {};
    let rerenderView;
    const question = { id: 'multi', text: 'Múltiple', type: 'multi', opts: ['Ansiedad', 'Estrés'] };
    const setData = patch => { data = { ...data, ...patch }; rerenderView(); };
    const view = render(<QuestionBlock {...commonProps} questions={[question]} data={data} setData={setData} onFinish={vi.fn()} />);
    rerenderView = () => view.rerender(<QuestionBlock {...commonProps} questions={[question]} data={data} setData={setData} onFinish={vi.fn()} />);
    await user.click(screen.getByRole('checkbox', { name: 'Ansiedad' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ansiedad' }));
    expect(data.multi).toEqual([]);
  });
});
