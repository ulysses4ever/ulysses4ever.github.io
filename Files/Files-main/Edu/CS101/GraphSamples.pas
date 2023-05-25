uses GraphABC;

{ Напишите процедуру TextOutRightBottomCorner, 
  которая выводит заданный текст в правый нижний угол графического окна. 
  Текст должен располагаться в указанном месте независимо от его размера }
procedure TextOutRightBottomCorner(str: string);
var
  w, h: integer;
begin
  w := textWidth(str);
  h := TextHeight(str);
  TextOut(window.width - w, window.height - h, str);
end;

{ Заполните графическое окно мозаикой из эллипсов }
procedure RandEllipse(sz, sz1: integer);
begin
  for var x := 0 to Window.Width div sz do
    for var y := 0 to Window.Height div sz1 do
    begin
      Brush.Color := clRandom;
      Ellipse(x * sz, y * sz1, (x + 1) * sz + 1, (y + 1) * sz1 + 1);
    end;
end;

{ Рисование циферблата }
procedure Clock;
begin
  SetCoordinateOrigin(Window.Width div 2, Window.Height div 2);
  Circle(0, 0, 200);
  var r := 180;
  var fi := 0.0;
  for var i := 1 to 12 do
  begin
    Circle(Round(r * Cos(fi)), Round(r * Sin(fi)), 5);
    fi += Pi / 6;
    //coordinate.angle+=360/12;
  end;
  SetCoordinateOrigin(0, 0);
end;

{ Движение круга }
procedure MoveCircleLURD(R: integer);
begin
  Window.Clear;
  Brush.Color := clRandom;
  LockDrawing;
  var y := 0;
  for var x := r to Window.Width - r do
  begin
    Window.Clear;
    Circle(x, x, R);
    Redraw;
    Sleep(1);
  end;
end;

{ Отскок от стенок }
procedure PinkPonk;
begin
  Window.Clear;
  Brush.Color := clRandom;
  LockDrawing;
  var x := 0;
  var dx := 5;
  for var i := 0 to 1000 do
  begin
    Window.Clear;
    Circle(x, window.Height div 2, 10);
    x += dx;
    if (x + dx > Window.Width) or (x + dx < 0) then
      dx *= -1;
    Redraw;
    Sleep(3);
  end;
end;

{ Из методички пример 4: рисование калейдоскопа }
procedure Sample4;
var
  p: Picture;
begin
  Window.Clear;
  LockDrawing;
  P := new Picture(window.Width div 2, window.Height div 2);
  for var i := 1 to 100 do
  begin
    Brush.Color := clRandom;
    P.Circle(Random(window.Width {div 2}), Random(window.Height {div 2}), Random(50) + 5);
  end;
  P.draw(0, 0);
  p.FlipVertical;
  p.Draw(0, window.Height div 2);
  p.FlipHorizontal;
  P.draw(window.Width div 2, window.Height div 2);
  p.FlipVertical;
  P.draw(window.Width div 2, 0);
  Redraw;
end;

{ Основная программа: демонстрация процедур рисования }
begin
  TextOutRightBottomCorner('Hello, world');
  Sleep(100);
  RandEllipse(20, 30);
  Sleep(100);
  Clock;
  Sleep(1000);
  MoveCircleLURD(15);
  Sleep(100);
  PinkPonk;
  Sleep(100);
  Sample4;
end.
