import {
  Flex,
  ListItem,
  type ListItemProps,
  OrderedList,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import React from "react";

export default function Tos() {
  function ListItemTitle({ children, ...props }: ListItemProps) {
    return (
      <ListItem fontWeight={"bold"} fontSize={"xl"} {...props}>
        {children}
      </ListItem>
    );
  }

  return (
    <Flex
      flexDir={"column"}
      maxW="1200px"
      mx="auto"
      w="100%"
      mt={"75px"}
      px="4"
      mb={16}
    >
      {/* <VStack w='100%' align={"start"} spacing={16}>

            </VStack> */}

      <OrderedList spacing={10} listStylePos={"inside"} marginInlineStart={0}>
        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Use of the Site</ListItemTitle>
          <Text>
            You may use the Site only for lawful purposes and in accordance with
            these Terms. You agree not to use the Site:
          </Text>
          <UnorderedList listStylePos={"inside"} spacing={2}>
            <ListItem>
              In any way that violates any applicable federal, state, local, or
              international law or regulation (including, without limitation,
              any laws regarding the export of data or software to and from the
              United States or other countries).
            </ListItem>
            <ListItem>
              To impersonate or attempt to impersonate ismcserver.online, a
              ismcserver.online employee, another user, or any other person or
              entity.
            </ListItem>
            <ListItem>
              To engage in any other conduct that restricts or inhibits anyone's
              use or enjoyment of the Site, or which, as determined by us, may
              harm ismcserver.online or users of the Site or expose them to
              liability.
            </ListItem>
          </UnorderedList>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Intellectual Property Rights</ListItemTitle>
          <Text>
            The Site and its entire contents, features, and functionality
            (including but not limited to all information, software, text,
            displays, images, video, and audio, and the design, selection, and
            arrangement thereof), are owned by ismcserver.online, its licensors,
            or other providers of such material and are protected by United
            States and international copyright, trademark, patent, trade secret,
            and other intellectual property or proprietary rights laws.
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Disclaimer of Warranties</ListItemTitle>
          <Text>
            ismcserver.online does not guarantee, represent, or warrant that
            your use of the Site will be uninterrupted or error-free, and you
            agree that from time to time, ismcserver.online may remove the Site
            for indefinite periods of time or cancel the Site at any time,
            without notice to you.
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Limitation of Liability</ListItemTitle>
          <Text>
            In no event shall ismcserver.online, its officers, directors,
            employees, or agents, be liable to you for any direct, indirect,
            incidental, special, punitive, or consequential damages whatsoever
            resulting from any (i) errors, mistakes, or inaccuracies of content,
            (ii) personal injury or property damage, of any nature whatsoever,
            resulting from your access to and use of the Site, (iii) any
            unauthorized access to or use of our secure servers and/or any and
            all personal information and/or financial information stored
            therein, (iv) any interruption or cessation of transmission to or
            from the Site, (iv) any bugs, viruses, trojan horses, or the like,
            which may be transmitted to or through the Site by any third party,
            and/or (v) any errors or omissions in any content or for any loss or
            damage of any kind incurred as a result of your use of any content
            posted, emailed, transmitted, or otherwise made available via the
            Site, whether based on warranty, contract, tort, or any other legal
            theory.
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Indemnification</ListItemTitle>
          <Text>
            You agree to indemnify, defend, and hold harmless ismcserver.online,
            its affiliates, licensors, and service providers, and its and their
            respective officers, directors, employees, contractors, agents,
            licensors, suppliers, successors, and assigns from and against any
            claims, liabilities, damages, judgments, awards, losses, costs,
            expenses, or fees (including reasonable attorneys' fees) arising out
            of or relating to your violation of these Terms or your use of the
            Site.
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Governing Law</ListItemTitle>
          <Text>
            These Terms and any dispute or claim arising out of or in connection
            with them or their subject matter or formation (including without
            limitation any non-contractual disputes or claims), shall be
            governed by and construed in accordance with the laws of the State
            of California, without giving effect to any choice or conflict of
            law provision or rule (whether of the State of California or any
            other jurisdiction).
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Changes to the Terms</ListItemTitle>
          <Text>
            ismcserver.online may revise and update these Terms from time to
            time in its sole discretion. All changes are effective immediately
            when we post them, and apply to all access to and use of the Site
            thereafter. Your continued use of the Site following the posting of
            revised Terms means that you accept and agree to the changes.
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Termination</ListItemTitle>
          <Text>
            ismcserver.online reserves the right to terminate your access to the
            Site at any time without notice for any reason whatsoever.
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>Miscellaneous</ListItemTitle>
          <Text>
            These Terms constitute the entire agreement between you and
            ismcserver.online regarding the use of the Site. If any provision of
            these Terms is held to be invalid or unenforceable, such provision
            shall be struck and the remaining provisions shall be enforced.
            ismcserver.online's failure to enforce any right or provision in
            these Terms shall not constitute a waiver of such right or provision
            unless acknowledged and agreed to by us in writing.
          </Text>
        </VStack>

        <VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
          <ListItemTitle>API restrictions</ListItemTitle>
          <Text>
            Please <b>do not</b> ddos the API to keep fair user experience.
            Thanks!
          </Text>
        </VStack>
      </OrderedList>

      <Text mt={5} fontSize={"sm"} fontWeight={"semibold"}>
        Copyright imexoodeex © {new Date().getFullYear()}
      </Text>
    </Flex>
  );
}
