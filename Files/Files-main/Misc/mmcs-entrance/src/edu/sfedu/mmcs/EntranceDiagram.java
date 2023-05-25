package edu.sfedu.mmcs;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.Calendar;
import java.util.NoSuchElementException;
import java.util.Scanner;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtilities;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.encoders.ImageEncoder;
import org.jfree.chart.encoders.ImageEncoderFactory;
import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.data.category.CategoryDataset;
import org.jfree.data.category.DefaultCategoryDataset;

public class EntranceDiagram {
	
	private String outFileName;

	private Scanner inFileScanner;

	private Calendar currentTime;
	
	public final int IMG_WIDTH = 600;
	public final int IMG_HEIGHT = 300;

	public EntranceDiagram(String inFileName) throws FileNotFoundException {
		inFileScanner = new Scanner( new File(inFileName) );
		currentTime = Calendar.getInstance();
		readTimestamp(); // fill currentTime (use inFileScanner)
		outFileName = Integer.toString(currentTime.get(Calendar.MONTH)) +
			"." + Integer.toString(currentTime.get(Calendar.DAY_OF_MONTH)) +
			"-" + Integer.toString(currentTime.get(Calendar.HOUR_OF_DAY)) +
			"." + Integer.toString(currentTime.get(Calendar.MINUTE));
	}

	private void generateNewDiagram() {
		CategoryDataset dataset = getData();
        final JFreeChart chart = createChart(dataset);
        try {
            ChartUtilities.saveChartAsPNG(new File(outFileName), chart, 
            		IMG_WIDTH, IMG_HEIGHT);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			System.err.println("Some problems while creating PNG image");
			e.printStackTrace();
		}
		inFileScanner.close();
	}

	private void readTimestamp() {
		String t = inFileScanner.nextLine();
		String[] firstLineContents = t.split("\\s");
		String[] date = firstLineContents[1].split("\\.");
		String[] time = firstLineContents[2].split(":");
		
		currentTime.set(Integer.parseInt(date[2]), 
				Integer.parseInt(date[1]), Integer.parseInt(date[0]), 
				Integer.parseInt(time[0]), Integer.parseInt(time[1]));
	}

	private boolean newData() {
		// TODO implement time comparison for entrance data processed 
		return true;
	}
	
	private CategoryDataset getData() {
		// TODO implement data extraction with inFileScanner
		final String[] columnKeys = {"Математика", 
				"Информационные технологии", 
				"Прикладная математика и информатика", 
				"Механика"};
		final String[] rowKeys = {"Запланировано мест",
				"Подано заявлений"}; 
		final Number[][] values = new Number[][] { 
				{30, 40, 97, 25}, // <- predifined 
				{0, 0, 0, 0},     // <- stub values
				};
		
		// searching first line with valuable data — it should start with 010101
		final String firstChipher = "010101";
		boolean firstChipherFound = false;
		String fileLine = "";
		while (inFileScanner.hasNextLine()) {
			fileLine = inFileScanner.nextLine();
			fileLine = fileLine.trim();
			if (fileLine.startsWith(firstChipher)) {
				firstChipherFound = true;
				break;
			}
		}
		
		// is line with '010101' wasn't found — give it up
		if (!firstChipherFound)
			throw new IllegalArgumentException("Malformed file");
		
		
		for (int i = 0; i < columnKeys.length; ++i) {
			String[] tokens = fileLine.split("\\s");
			values[1][i] = Integer.parseInt(tokens[tokens.length - 1]);
			try {
				// each valuable line followed by redundant one — skip it
				inFileScanner.nextLine();
				// pretend that the number of valuable lines is equal to
				// columnKeys.length so here we can read next line
				fileLine = inFileScanner.nextLine();				
			} catch (NoSuchElementException e) {
				throw new IllegalArgumentException("Malformed file");
			}
		}
		DefaultCategoryDataset ds = new DefaultCategoryDataset(); 
		for (int row = 0; row < rowKeys.length; ++row)
			for (int col = 0; col < columnKeys.length; ++col)
				ds.setValue(values[row][col], rowKeys[row], columnKeys[col]);
		return ds;
	}

	private JFreeChart createChart(final CategoryDataset dataset) {
		// chart object
        final JFreeChart chart = ChartFactory.createBarChart(
                "Сводка о приёме заявлений абитуриентов (" +
	    			Integer.toString(currentTime.get(Calendar.DAY_OF_MONTH)) +
	    			"." + 
	            	Integer.toString(currentTime.get(Calendar.MONTH)) +
	    			"." + 
                	Integer.toString(currentTime.get(Calendar.YEAR)) +
	    			" " + 
	    			Integer.toString(currentTime.get(Calendar.HOUR_OF_DAY)) +
	    			":" + 
	    			Integer.toString(currentTime.get(Calendar.MINUTE)) +
					")",
                "Отделения",              // domain axis label
                "Места",	                // range axis label
                dataset,                    // data
                PlotOrientation.HORIZONTAL, // orientation
                true,                       // include legend
                true,
                false
            );

        // allow spliting axis' labels
        chart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelLines(3);

        // set visible data values
        BarRenderer renderer = (BarRenderer) chart.getCategoryPlot().getRenderer();
        DecimalFormat decimalformat1 = new DecimalFormat("###");
        renderer.setBaseItemLabelGenerator(new StandardCategoryItemLabelGenerator("{2}", decimalformat1));
        renderer.setBaseItemLabelsVisible(true);

        // NOW DO SOME OPTIONAL CUSTOMISATION OF THE CHART...
/*
        // set the background color for the chart...
        chart.setBackgroundPaint(Color.lightGray);

        // get a reference to the plot for further customisation...
        final CategoryPlot plot = chart.getCategoryPlot();
        plot.setRangeAxisLocation(AxisLocation.BOTTOM_OR_LEFT);
        
        // change the auto tick unit selection to integer units only...
        final NumberAxis rangeAxis = (NumberAxis) plot.getRangeAxis();
        rangeAxis.setRange(0.0, 100.0);
        rangeAxis.setStandardTickUnits(NumberAxis.createIntegerTickUnits());
        
        // OPTIONAL CUSTOMISATION COMPLETED.
*/        
        return chart;
	}

	/**
	 * @param args
	 * @throws FileNotFoundException 
	 */
	public static void main(String[] args) throws FileNotFoundException {
		if (0 == args.length) {
			System.out.println("Please, specify input file with entrance data"
					+ " as command-line parameter.");
			return;
		}
		
		EntranceDiagram me = new EntranceDiagram(args[0]);
		if (me.newData()) ;
			me.generateNewDiagram();
	}
}
