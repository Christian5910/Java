import java.io.FileInputStream;
import java.lang.reflect.InvocationTargetException;

/** Initializes stdin inside the same application context as the student's main. */
public class StudyRunner {
    public static void main(String[] args) throws Exception {
        System.setIn(new FileInputStream("/str/input.txt"));
        try {
            Class.forName("Main").getMethod("main", String[].class).invoke(null, (Object) new String[0]);
        } catch (InvocationTargetException error) {
            error.getCause().printStackTrace();
            System.exit(1);
        }
    }
}
