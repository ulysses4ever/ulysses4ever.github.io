import java.math.BigInteger;

// Найти наибольшее простое число, являющееся делителем числа 1630289096130218.

public class Task4 {
	
	/**
	 * Поиск наибольшего простого делителя числа n
	 */
	public static BigInteger findMaxPrimeDiv (BigInteger n) {
		BigInteger i;
		for (i = new BigInteger("2"); n.compareTo(BigInteger.ONE) != 0; i = i.add(BigInteger.ONE)) {
			while (true) {
				BigInteger[] divMod = n.divideAndRemainder(i);
				if (!divMod[1].equals(BigInteger.ZERO))
					break;
				n = divMod[0];
			//while (n.mod(i).equals(BigInteger.ZERO))
				//n = n.divide(i);
			}
		}
		return i;
	}
	
	public static final BigInteger N = new BigInteger("1630289096130218");//

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		System.out.printf("%s\n", findMaxPrimeDiv(N));
	}

}
