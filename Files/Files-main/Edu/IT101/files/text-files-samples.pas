// Дан текстовый файл. Посчитать количество пробельных символов
// в этом файле (посимвольное чтение).
function CountSpaces (filename: string): integer;
begin
  // Файловая переменная
  var f: text;
  
  // Связывание файловой переменной с конкретным файлом на диске
  Assign(f, filename);
  
  // Открытие файла для чтения
  Reset(f);
  var cnt := 0;
  
  // Чтение до конца файла (пока не достигнут конец файла)
  while not EOF(f) do
  begin
    var c: char;
    Read(f, c); // Чтение одного символа из файла
    if c = ' ' then 
      cnt += 1;
  end;
  
  // Закрытие файла
  Close(f);
  Result := cnt;
end;

// Дан текстовый файл. Посчитать количество строк
// в этом файле (построчное чтение).
function CountLines (filename: string): integer;
begin
  // Файловая переменная
  var f: text;
  
  // Связывание файловой переменной с конкретным файлом на диске
  Assign(f, filename);
  
  // Открытие файла для чтения
  Reset(f);
  
  var cnt := 0;
  // Чтение до конца файла (пока не достигнут конец файла)
  while not EOF(f) do
  begin
    var s: string;
    // Чтение строки вплоть до символов конца строки 
    // (концевые символы в строку не включаются).
    Readln(f, s);
    cnt +=1;
  end;
  // Закрытие файла
  Close(f);
  Result := cnt;
end;

// Дан текстовый файл, содержащий целые числа. 
// Посчитать количество чисел в файле (чтение числовых данных).
function CountNumbers(filename: string): integer;
begin
  // Файловая переменная
  var f: text;
  
  // Связывание файловой переменной с конкретным файлом на диске
  Assign(f, filename);
  
  // Открытие файла для чтения
  Reset(f);
  
  var cnt := 0;
  // Чтение до конца файла (пока не достигнут конец файла).
  // Функция SeekEOF игнорирует пробельные символы в конце файла.
  while not SeekEOF(f) do
  begin
    var a: integer;
    Read(f, a); // Чтение одного числа из файла
    cnt +=1;
  end;

  // Закрытие файла
  Close(f);
  Result := cnt;
end;

begin
  // Обработка файла a.txt из текущего каталога (относительный путь к файлу)
  Writeln(CountSpaces('a.txt'));
  
  // Обработка файла a.txt из корневого каталога диска D: (абсолютный путь к файлу)
  Writeln(CountSpaces('D:\a.txt'));
  
  Writeln(CountLines('b.txt'));
  
  Writeln(CountNumbers('c.txt'));
end.
