{Вариант 2}
{Определить запись FunctionPoint хранящую пару вещественных чисел, 
считающихся аргументом и значеним некоторой функции. Опишите методы для 
инициализации полей записи (Init), для их вывода (Print), для вычисления номера 
координатной четверти, к которой принадлежит данная точка графика функции}
type FunctionPoint = record
      x, y : integer;
      
      procedure Init(x, y : integer);
      begin
        self.x := x;
        self.y := y;
      end;
      
      procedure Print();
      begin
        writeln(self.x, ', ', self.y);
      end;
      
      /// Вычисляет номера координатной четверти, 
      /// к которой принадлежит данная точка графика функции
      function ComputationQuadrant() : integer;
      begin
        Result := 1;
        if (x < 0) and (y > 0) then 
          Result := 2
        else if (x < 0) and (y < 0) then
          Result := 3
        else if (x > 0) and (y < 0) then
          Result := 4;          
      end;
end; 

/// Создаёт массив со случайными точками
function RandomPoint(n : integer) : array of FunctionPoint;
begin
  SetLength(Result, n);
  //a.Init(R)
  for var i := 0 to Result.Length - 1 do
    Result[i].Init(Random(integer.MinValue, integer.MaxValue),
                    Random(integer.MinValue, integer.MaxValue));
end;

/// Определение количества точек, принадлежащих заданной координатной четверти
function CountPointsInQuadrant(a : array of FunctionPoint; q : integer) : integer;
begin
  Result := 0;
  for var i := 0 to a.Length - 1 do
    if a[i].ComputationQuadrant = q then
      Result += 1;
end;

procedure Print(a : array of FunctionPoint);
begin
  for var i := 0 to a.Length - 1 do
    a[i].Print;
end;
     
begin
  var a : FunctionPoint;
  var x, y : integer;
  writeln('Введите координаты точки');
  readln(x, y);
  a.Init(x, y);
  a.Print;
  writeln('Координатная четверть - ', a.ComputationQuadrant);
end.      
