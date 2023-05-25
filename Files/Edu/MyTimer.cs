using System;
using System.Timers;

namespace MyTimer
{
	
    class CallBack { 
		
        private String param;
		
        public CallBack(String param) {
            this.param = param;
        }

        public void OnTimedEvent(object source, ElapsedEventArgs e) {
            Console.WriteLine("The param: {0}", param);
        }

    }
	
    class MainClass {		
        public static void Main(string[] args) {
            Timer aTimer = new System.Timers.Timer(3000);

            // 1-st timer
            CallBack cb = new CallBack("importantParam1");
            aTimer.Elapsed += new ElapsedEventHandler(cb.OnTimedEvent);

            aTimer.Interval = 2000;
            aTimer.Enabled = true;
            aTimer.AutoReset = false;

            // 2-nd timer
            aTimer = new System.Timers.Timer(3000);
            CallBack cb2 = new CallBack("importantParam2");
            aTimer.Elapsed += new ElapsedEventHandler(cb2.OnTimedEvent);

            aTimer.Interval = 2000;
            aTimer.Enabled = true;
            aTimer.AutoReset = false;

            Console.WriteLine("Press the Enter key to exit the program.");
            Console.ReadLine();        
        }
    }
}
