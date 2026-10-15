import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import org.eclipse.jdt.internal.compiler.batch.Main;
import org.eclipse.jdt.internal.compiler.classfmt.ClassFileConstants;

/** Uses the browser runtime's Java 8 API with Java 17 language syntax. */
public class StudyCompiler extends Main {
    private static String diagnostics = "";

    public StudyCompiler(PrintWriter writer) {
        super(writer, writer, false);
    }

    @Override
    protected long validateClasspathOptions(ArrayList<String> boot, ArrayList<String> endorsed, ArrayList<String> ext) {
        return ClassFileConstants.JDK1_8;
    }

    public static boolean compileSource(String directory) {
        String[] args = {"-17", "-bootclasspath", "/lt/8/jre/lib/rt.jar", "-classpath", directory,
            "-proc:none", "-encoding", "UTF-8", "-d", directory, "/str/Main.java"};
        StringWriter buffer = new StringWriter();
        PrintWriter writer = new PrintWriter(buffer);
        boolean compiled = new StudyCompiler(writer).compile(args);
        writer.flush();
        diagnostics = buffer.toString();
        return compiled;
    }

    public static String getDiagnostics() {
        return diagnostics;
    }
}
