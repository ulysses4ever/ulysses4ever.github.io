package edu.mmcs;

import java.math.BigInteger;
import java.util.Date;
import java.util.Random;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class Point {
	
	double x;
	
	double y;

	public Point(double x, double y) {
		this.x = x;
		this.y = y;
	}
	
	
}

public class MainClass {

	/**
	 * @param args Аргументы командной строки
	 */
	public static void main(String[] args) {
		
//		String s1 = " H e l l o " ;
//		String s2 = " H e l l o " ;
//		System.out.println( s1 == s2 ) ; // ???
//		System.out.println( s1.equals(s2) ) ; // ???
//
//		int[] a1 = {1, 2, 3, 4, 5};
//		int[] a2 =  {1, 2, 3, 4, 5};
//		System.out.println( a1 == a2 ); // ???
//		System.out.println( a1.equals(a2) ) ; // ???

//		Point p1 = new Point(1, 2);
//		Point p2 = new Point(1, 2);
//		System.out.println(p1 == p2);
		
//		System.in.
//		Scanner in = new Scanner(System.in);
//		if ( in.hasNextInt()) {
//			int a = in.nextInt();
//			System.out.println(a);
//		} else {
//			// Сообщение об ошибке
//			System.out.println("Не число!");
//		}

//		Date now = new Date();
//		System.out.printf("%tB\n", now);
//		
//		final int BIT_LENGTH = 256;
//		Random rng = new Random();
//		BigInteger p = BigInteger.probablePrime(BIT_LENGTH, rng);
//		BigInteger a = new BigInteger(p.bitLength(), rng);
//		
//		System.out.println(
//				a.modPow(p.subtract(BigInteger.ONE), p)); // a^{p-1} mod p
		
//		bi.

//		// Исходная строка в виде StringBuilder 
//		StringBuilder sb = new StringBuilder("abc bcd cde");
//		System.out.println("Исходная строка: " + sb);
//
//		String target = "bc"; // искомая строка
//		StringBuilder indecies = // позиции вхождений target в строку sb
//				new StringBuilder();   
//		while (true) {
//			int targetPos = sb.lastIndexOf(target);
//			if (targetPos == -1)
//				break;
//			indecies.insert(0, targetPos + " ");
//			sb.delete(targetPos, targetPos + target.length());
//		}
//		System.out.println("Позиции вхождений подстроки " + target + ": "
//				+ indecies);
//		System.out.println("Результирующая строка: " + sb);
//
//		String str = "42";
//		String re = "\\d+( \\*|\\+ \\d+)?"; 
//		
//		Pattern pat1 = Pattern.compile(re);
//		Matcher m = pat1.matcher(str);
//		System.out.println(m.matches());
//		
//		
//		while (m.find())
//			System.out.println(m.group());
//		
//		Pattern pat = Pattern.compile("солнце", 
//				Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
//		Matcher matcher = pat.matcher("И восходит Солнце");
//		StringBuffer result = new StringBuffer();
//		int i = 1;
//		while (matcher.find())
//		    matcher.appendReplacement(result, "луна-" + ++i);
//		matcher.appendTail(result);
//		System.out.println(result);
//		
//		String str = "11:59am";
//		Pattern p = Pattern.compile("(1?[0-9]):([0-5][0-9])([ap])m");
//		Matcher m = p.matcher(str);
//		if (m.matches())
//			System.out.println("It is " +
//					m.group(1) + " o'clock and " +
//					m.group(2) + " minutes " +
//					(m.group(3).equals("a") ? "before" : "after") +
//					" midday.");
		
//		String s = " abc   bcd  ";
//		String[] parts = s.split("\\s+");
//		for (String p : parts) {
//			System.out.println(p);
//		}
//		
//		Scanner sc = new Scanner("15$10;7:10");
//		sc.useDelimiter("[:;$]");
//		int sum = 0;
//		while (sc.hasNextInt())
//			sum += sc.nextInt();
//		System.out.println(sum);
		
		//System.out.println(BigInteger.probablePrime(512, new Random()));
//		BigInteger nn = new BigInteger("80609207374238574737099" +
//				"9447795366857394703331883838867868779000645487222208" +
//				"3446730687107272293230958497626189318512449131260291" +
//				"083642674198266378187999457");
//		System.out.println(nn.isProbablePrime(100));
//		System.out.println(nn);
//		n = n.multiply(new BigInteger("1009")).multiply(new BigInteger("2"));
//		System.out.println(n);
//		System.out.printf("%d\n", makePalindrom2(3, true));
//		System.out.printf("%d\n", makePalindrom2(3, false));
//		System.out.printf("%d\n", makePalindrom2(1, true));
//		System.out.printf("%d\n", makePalindrom2(1, false));
//		System.out.printf("%d\n", makePalindrom2(2, true));
//		System.out.printf("%d\n", makePalindrom2(2, false));
		
//		System.out.println(isPalindrom10(11));
//		System.out.println(isPalindrom10(12));
//		System.out.println(isPalindrom10(3));
	
//		int n = 1000000000;
//		BigInteger sum = BigInteger.ZERO;
//		int i = 1;
//		int k = 0;
//		while (true) {
////		for (int i = 0; i < max; ++i) {
//			k = makePalindrom2(i, true);
//			if (k < n && isPalindrom(k, 10))
//				sum = sum.add(BigInteger.valueOf(k));
//			k = makePalindrom2(i, false);
//			if (k < n && isPalindrom(k, 10))
//				sum = sum.add(BigInteger.valueOf(k));
//			if (k > n)
//				break;
//			++i;
//		}
//		System.out.println(sum);
//		
//		sum = BigInteger.ZERO;
//		for (i = 1; i < n; ++i) {
//			if (isPalindrom(i, 10) && isPalindrom(i, 2))
//				sum = sum.add(BigInteger.valueOf(i));
//		}
//		System.out.println(sum);
//
		
		BigInteger n = //new BigInteger("16266938048121344381946768856510503182225113237415868353591960233025932144164395502526582475487740074248209650044758122346883267406790916532101551183382904226");
				BigInteger.probablePrime(40, new Random());
		System.out.println("large prime factor: " + n);
		n = n.multiply(new BigInteger("1009")).multiply(new BigInteger("2"));
		System.out.println("n : " + n);
		BigInteger nsqrt = sqrt(n); // "600851475143");//
//		System.out.println(nsqrt);
		BigInteger k = BigInteger.ONE.add(BigInteger.ONE);
		final BigInteger two = k;
		while (n.mod(k).equals(BigInteger.ZERO)) {
			n = n.divide(k);
		}
		BigInteger knext = k.add(BigInteger.ONE);
		
		do {
			k = knext;
			if (n.mod(k).equals(BigInteger.ZERO)) {
				do {
					n = n.divide(k);
				} while (n.mod(k).equals(BigInteger.ZERO));
				nsqrt = sqrt(n);
			}
			knext = k.add(two);
		} while (knext.compareTo(nsqrt) <= 0);
//		System.out.println("k = " + k);
		System.out.println("p = " + (n.equals(BigInteger.ONE) ? k : n));
	}
	
	public static BigInteger sqrt(BigInteger n) {
		BigInteger res = BigInteger.ONE;
		BigInteger next = res.add(BigInteger.ONE);
		while (next.multiply(next).compareTo(n) < 0) {
			res = next;
			next = next.add(BigInteger.ONE);
		}
		return res;
	}

	public static int makePalindrom2(int n, boolean isOdd) {
		int res = n;
		if (isOdd)
			n /= 2;
		while(n > 0) {
			res = res * 2 + n % 2;
			n /= 2;
		}
		return res;
	}
	
	public static boolean isPalindrom(int n, int base) {
		int reversed = 0;
		int k = n;
		while (k > 0) {
			reversed = reversed * base + k % base;
			k /= base;
		}
		return (n == reversed);
	}
}
