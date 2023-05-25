// -------------------------------------------------- 
// Тесты к заданиям #1-#6 лабораторной #13
// -------------------------------------------------- 

// TODO
// Скопируйте тестирующие процедуры в файлы соответствующих заданий
// лабораторной работы. Изучите тесты.
// Убедитесь, что все тесты проходят. Если нет, исправьте ошибки.

procedure TestIsDigit;
begin
  for var d := 0 to 9 do
    Assert(IsDigit(d), 'IsDigit(' + d.ToString + ')');
  Assert(not IsDigit(-5),     'not IsDigit(-5)');
  Assert(not IsDigit(10),     'not IsDigit(10)');
  Assert(not IsDigit(27),     'not IsDigit(27)');
  Assert(not IsDigit(-107),   'not IsDigit(-107)');
end;

procedure TestAddRightDigit;
begin
  AddRightDigit(-3, 7);   // должно падать. Если да, это верно, закомментируйте
  AddRightDigit(5, 0);    // должно падать. Если да, это верно, закомментируйте
  
  Assert(AddRightDigit(0, 5) = 50,        'AddRightDigit(0, 5) = 50');
  Assert(AddRightDigit(7, 5) = 57,        'AddRightDigit(7, 5) = 57');
  Assert(AddRightDigit(0, 1) = 10,        'AddRightDigit(0, 1) = 10');
  Assert(AddRightDigit(8, 102) = 1028,    'AddRightDigit(8, 102) = 1028');
  Assert(AddRightDigit(0, 1000) = 10000,  'AddRightDigit(0, 1000) = 10000');
  Assert(AddRightDigit(1, 97) = 971,      'AddRightDigit(1, 97) = 971');
end;

/// Возвращает истину, если вещественные числа x, y равны с точностью eps
function AreEquals(x, y: real; eps: real): boolean;
begin
  Result := Abs(x - y) < eps;
end;

procedure TestMean(eps: real);
begin
  var am, gm: real;
  Mean(-1, 0, am, gm);    // должно падать. Если да, это верно, закомментируйте
  Mean(5, -6, am, gm);    // должно падать. Если да, это верно, закомментируйте
  Mean(0, 4, am, gm);     // должно падать. Если да, это верно, закомментируйте
  
  var x, y: real;
  // test 1: equal values
  x := 2;
  y := x;
  Mean(x, y, am, gm);
  Assert(AreEquals(am, x, eps) 
    and AreEquals(gm, x, eps),   'AreEquals(am, x, eps) and AreEquals(gm, x, eps)');
  // test 2: different values
  Mean(3, 27, am, gm);
  Assert(AreEquals(am, 15, Eps) 
    and AreEquals(gm, 9, Eps),   'AreEquals(am, 15, Eps) and AreEquals(gm, 9, Eps)');
  // test 3: different values
  Mean(6.05, 5, am, gm);
  Assert(AreEquals(am, 5.525, Eps) 
    and AreEquals(gm, 5.5, Eps), 'AreEquals(am, 5.525, Eps) and AreEquals(gm, 5.5, Eps)');
end;

procedure TestAddLeftDigit;
begin
  AddLeftDigit(-3, 7);    // должно падать. Если да, это верно, закомментируйте
  AddLeftDigit(5, 0);     // должно падать. Если да, это верно, закомментируйте
  
  var k := 5;
  AddLeftDigit(0, k);
  Assert(k = 5,     'k = 5');
  
  k := 5;
  AddLeftDigit(7, k);
  Assert(k = 75,    'k = 75');
  
  k := 1;
  AddLeftDigit(0, k);
  Assert(k = 1,     'k = 1');
  
  k := 102;
  AddLeftDigit(8, k);
  Assert(k = 8102,  'k = 8102');
  
  k := 1000;
  AddLeftDigit(0, k);
  Assert(k = 1000,  'k = 1000');
  
  k := 97;
  AddLeftDigit(1, k);
  Assert(k = 197,   'k = 197');
end;

procedure TestDigitN;
begin
  DigitN(34, -2);         // должно падать. Если да, это верно, закомментируйте     
  DigitN(34, 0);          // должно падать. Если да, это верно, закомментируйте    
    
  Assert(DigitN(0, 1) = 0,      'DigitN(0, 1) = 0');
  Assert(DigitN(0, 2) = -1,     'DigitN(0, 2) = -1');
  Assert(DigitN(0, 5) = -1,     'DigitN(0, 5) = -1');
  
  Assert(DigitN(5, 1) = 5,      'DigitN(5, 1) = 5');
  Assert(DigitN(-5, 1) = 5,     'DigitN(-5, 1) = 5');   
  
  Assert(DigitN(60, 1) = 0,     'DigitN(60, 1) = 0');
  Assert(DigitN(-60, 1) = 0,    'DigitN(-60, 1) = 0');
  Assert(DigitN(60, 2) = 6,     'DigitN(60, 2) = 6');
  Assert(DigitN(-60, 2) = 6,    'DigitN(-60, 2) = 6');
  
  Assert(DigitN(60, 3) = -1,    'DigitN(60, 3) = -1');
  
  Assert(DigitN(6034, 3) = 0,   'DigitN(6034, 3) = 0');
  Assert(DigitN(-6078, 2) = 7,  'DigitN(-6078, 2) = 7');
  Assert(DigitN(6078, 4) = 6,   'DigitN(6078, 4) = 6');
  Assert(DigitN(-6078, 4) = 6,  'DigitN(-6078, 4) = 6');
  
  Assert(DigitN(6078, 6) = -1,  'DigitN(6078, 6) = -1');
end;

procedure TestFibN;
begin
  FibN(0);        // должно падать. Если да, это верно, закомментируйте
  FibN(-2);       // должно падать. Если да, это верно, закомментируйте   

  Assert(FibN(1) = 1,     'FibN(1) = 1');
  Assert(FibN(2) = 1,     'FibN(2) = 1');
  
  Assert(FibN(3) = 2,     'FibN(3) = 2');
  Assert(FibN(4) = 3,     'FibN(4) = 3');
  Assert(FibN(7) = 13,    'FibN(7) = 13');
  Assert(FibN(10) = 55,   'FibN(10) = 55');
end;


begin
  TestIsDigit;
  
  TestAddRightDigit;
  
  TestMean(0.0000001);
  
  TestAddLeftDigit;
  
  TestDigitN;
  
  TestFibN;
  
end.