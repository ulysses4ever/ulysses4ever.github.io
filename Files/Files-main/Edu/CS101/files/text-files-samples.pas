// ------------------------- Пример 1
// Дан текстовый файл. Посчитать количество пробельных символов
// в этом файле (посимвольное чтение).

/// <summary>
/// Определяет количество пробелов в текстовом файле filename
/// </summary>
/// <param name="filename">Имя текстового файла</param>
/// <returns>Количество пробелов в файле filename</returns>
function CountSpaces(filename: string): integer;
begin
  // Файловая переменная
  var f: text;
  
  // Связывание файловой переменной с конкретным файлом на диске
  Assign(f, filename);
  
  // Открытие файла для чтения
  Reset(f);
  
  var cnt := 0;
  try
    // Чтение до конца файла (пока не достигнут конец файла)
    while not EOF(f) do
    begin
      var c: char;
      Read(f, c); // Чтение одного символа из файла
      if c = ' ' then 
        cnt += 1;
    end;
  finally
    // Закрытие файла
    Close(f);
  end;
  Result := cnt;
end;

// ------------------------- Пример 2
// Дан текстовый файл. Посчитать количество строк
// в этом файле (построчное чтение).

/// <summary>
/// Определяет количество строк в текстовом файле filename
/// </summary>
/// <param name="filename">Имя текстового файла</param>
/// <returns>Количество строк в файле filename</returns>
function CountLines(filename: string): integer;
begin
  // Файловая переменная
  var f: text;
  
  // Связывание файловой переменной с конкретным файлом на диске
  Assign(f, filename);
  
  // Открытие файла для чтения
  Reset(f);
  
  var cnt := 0;
  try
    // Чтение до конца файла (пока не достигнут конец файла)
    while not EOF(f) do
    begin
      var s: string;
      // Чтение строки вплоть до символов конца строки 
      // (концевые символы в строку не включаются).
      Readln(f, s);
      cnt +=1;
    end;
  finally
    // Закрытие файла
    Close(f);
  end;
  Result := cnt;
end;

// ------------------------- Пример 3
// Дан текстовый файл, содержащий целые числа. 
// Посчитать количество чисел в файле (чтение числовых данных).

/// <summary>
/// Определяет количество целых чисел в текстовом файле filename
/// </summary>
/// <param name="filename">Имя текстового файла</param>
/// <returns>Количество целых чисел в файле filename</returns>
function CountNumbers(filename: string): integer;
begin
  // Файловая переменная
  var f: text;
  
  // Связывание файловой переменной с конкретным файлом на диске
  Assign(f, filename);
  
  // Открытие файла для чтения
  Reset(f);
  
  var cnt := 0;
  try
    // Чтение до конца файла (пока не достигнут конец файла).
    // Функция SeekEOF игнорирует пробельные символы в конце файла.
    while not SeekEOF(f) do
    begin
      var a: integer;
      Read(f, a); // Чтение одного числа из файла
      cnt +=1;
    end;
  finally
    // Закрытие файла
    Close(f);
  end;
  Result := cnt;
end;

// ------------------------- Основная программа
begin
  try
    // Обработка файла a.txt из текущего каталога (относительный путь к файлу)
    Writeln(CountSpaces('a.txt'));
  except
    Writeln('Ошибка при работе с файлом a.txt');
  end;
  
  try
    // Обработка файла a.txt из корневого каталога диска D: (абсолютный путь к файлу)
    Writeln(CountSpaces('D:\a.txt'));
  except
    Writeln('Ошибка при работе с файлом D:\a.txt');
  end;
  
  var filename: string;
  filename := 'b.txt';
  try
    Writeln(CountLines(filename));
  except
    WritelnFormat('Ошибка при работе с файлом {0}', filename);
  end;
  
  filename := 'c.txt';
  try
    Writeln(CountNumbers(filename));
  except
    WritelnFormat('Ошибка при работе с файлом {0}', filename);
  end;
end.
