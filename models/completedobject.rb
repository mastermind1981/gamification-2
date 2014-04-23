require 'mongoid'

class Completedobject
  include Mongoid::Document

  belongs_to :quest
  belongs_to :level
  belongs_to :task
  belongs_to :checklistitem

  field :text, :type => String
  field :userId, :type => String
  field :groupId, :type => String
  field :finishedOn, :type => Integer
end