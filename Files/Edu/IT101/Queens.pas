uses Arrays;

var a : array of integer;
var count : integer;


procedure register;
begin
  //Arrays.WritelnArray(a);
  count += 1;
end;

function finalPos(position : integer) : boolean;
begin
  result := position = a.length;
end;

function admissible(position, step : integer) : boolean;
begin
  var i := 0;
  result := true;
  while (i < position) and result do
  begin
    result := (a[i] <> step)
        and (abs(a[i] - step)
              <> abs(i - position));
    i += 1;
  end;
end;

function hasNextStep(step : integer) : boolean;
begin
  result := step < a.length - 1;
end;

function nextStep(step : integer) : integer;
begin
  result := step + 1;
end;

procedure makeStep(position, step : integer);
begin
  a[position] := step;
end;

function initStep : integer;
begin
  result := -1;
end;

procedure backtrack;

  procedure run(position : integer);
  begin
    if finalPos(position) then
    begin
      register;
      exit;
    end;
    var step := initStep;
    while hasNextStep(step) do
    begin
      step := nextStep(step);
      if admissible(position, step) then
      begin
        makeStep(position, step);
        run(position + 1);
      end;
    end;
  end;

begin
  run(0);
end;

begin
  a := new integer[8];
  backtrack;
  writeln(count);
end.
