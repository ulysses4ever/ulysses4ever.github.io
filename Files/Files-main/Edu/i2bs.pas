// возвращает строковое двоичное представление целого положительного числа a
function Int2BinString(a : byte) : string;
begin
  for var i := 0 to 7 do
  begin
    if (a mod 2) > 0 then
      result := '1' + result
    else
      result := '0' + result;
    a := a div 2;
  end;
end;

// ниже приведена программа, демонстрирующая использование функции Int2BinString
begin
  Writeln(Int2BinString(5));
end.
