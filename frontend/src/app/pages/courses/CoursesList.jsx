import { Card, Button, Heading, Text } from "rsuite";
import { Link } from "react-router-dom";
import { siteUrls } from "../../utils/siteUrls";
import CheckIcon from "@rsuite/icons/Check";
import CloseIcon from "@rsuite/icons/Close";
import {ButtonAdd} from '../../components/ui';

export default function CoursesList() {
    const courses = [
        { id: 1, title: "Kurz první pomoci", desc: "Základy první pomoci pro zaměstnance", joined: false },
        { id: 2, title: "Kurz komunikace", desc: "Efektivní komunikace na pracovišti", joined: true },
        { id: 3, title: "Školení BOZP", desc: "Bezpečnost a ochrana zdraví při práci", joined: false },
    ];

    const handleJoin = (id) => console.log("join:", id);
    const handleLeave = (id) => console.log("leave:", id);

    return (
        <>
            <h2 className="page-title">Kurzy</h2>

            <div className="card-list">
              {courses.map((course) => (
                  <Card key={course.id} shaded className="mb-20">
                      <Card.Header>
                          <Heading level={5} size="md" bold>
                              <Link to={siteUrls.viewCourseChoice(course.id)}>
                                {course.title}
                              </Link>
                          </Heading>
                      </Card.Header>
                      <Card.Body>A passionate developer with a love for learning new technologies. Enjoys building innovative solutions and solving problems.</Card.Body>
                      <Card.Footer>
                          <Button color="green" size="xs" appearance="ghost" startIcon={<CheckIcon />} onClick={() => handleJoin(course.id)}>
                              Vzít účast
                          </Button>
                          <Button color="red" size="xs" appearance="ghost" startIcon={<CloseIcon />} onClick={() => handleLeave(course.id)}>
                              Neúčastnit se
                          </Button>
                      </Card.Footer>
                  </Card>
              ))}
            </div>

            <ButtonAdd link={siteUrls.addCourse} />
        </>
    );
}
