import {ScrollView, View} from 'react-native'
import {useTranslation} from '@shared/i18n'
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@shared/ui/accordion'
import {Text} from '@shared/ui/text'

export default function FaqScreen() {
  const {t} = useTranslation('FaqScreen')

  const faqItems = [
    {
      id: '1',
      question: t('itemQuestion1'),
      answer: t('itemAnswer1'),
    },
    {
      id: '2',
      question: t('itemQuestion2'),
      answer: t('itemAnswer2'),
    },
    {
      id: '3',
      question: t('itemQuestion3'),
      answer: t('itemAnswer3'),
    },
    {
      id: '4',
      question: t('itemQuestion4'),
      answer: t('itemAnswer4'),
    },
    {
      id: '5',
      question: t('itemQuestion5'),
      answer: t('itemAnswer5'),
    },
  ]

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3">
      <View>
        <Accordion type="multiple" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>
                <Text>{item.question}</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text>{item.answer}</Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </View>
    </ScrollView>
  )
}
