import { EditorElement } from "@/providers/editor/EditorProvider"
import React from "react"
import Text from "./funnel-editor/Text";
import Container from "./funnel-editor/Container";
import Video from "./funnel-editor/Video";
import LinkComponent from "./funnel-editor/Link";
import ContactFormComponent from "./funnel-editor/ContactForm";
import Checkout from "./funnel-editor/Checkout";

type Props = {
    element: EditorElement;
}

const FunnelEditorRecursive = ({ element }: Props) => {
    switch(element.type) {
        case "text":
            return <Text element={element} />
        case "__body":
            return <Container element={element} />
        case "container":
            return <Container element={element} />
        case "video":
            return <Video element={element} />
        case "link":
            return <LinkComponent element={element} />
        case "2Col":
            return <Container element={element} />
        case "contactForm":
            return <ContactFormComponent element={element} />
        case "paymentForm":
            return <Checkout element={element} />
        default:
            return null;
    }
}

export default FunnelEditorRecursive