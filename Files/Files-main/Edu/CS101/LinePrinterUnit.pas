unit LinePrinterUnit;

interface

type
  LinePrinter = class
  private
    fN: integer;
  
  protected
    // Методы, которые будут переопределены в наследниках

    // Вывод префикса i-й подстроки
    procedure PrintPrefix(i: integer);
  
    // Предварительная обработка исходной строки
    function Preprocess(line: string): string;

  public
    // Длина подстрок для вывода
    property N: integer read fN;
    
    // Конструктор для инициализации единственного поля fN
    constructor(n: integer);
    
    // Печать строки line кусочками дины N (невиртуальный метод!)
    procedure Print(line: string);
    
  end;
  
implementation

constructor LinePrinter.Create(N: integer);
begin
  // TODO: проверка, что N > 0, иначе исключение; инициализация поля fN
end;

procedure LinePrinter.Print(line: string);
begin
  line := Preprocess(line);
  var fullLinesCount := line.Length div fN;
  for var i := 1 to fullLinesCount do
  begin
    PrintPrefix; // 0. Вывод префикса
    // TODO 1. Вывод подстроки длины N, начиная с 0-го символа
    // TODO 2. Обрезание первых N символов строки line
  end;
  // TODO 3. Если строка line осталась непустой, вывести префикс и её
end;

procedure LinePrinter.PrintPrefix(i: integer); virtual;
begin
  // в базовом классе ничего не делаем: префикс пустой
end;

function LinePrinter.Preprocess(line: string): string; virtual;
begin
  // в базовом классе препроцессинга нет, строку не изменяем
  result := line
end;

begin

end.
