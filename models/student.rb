require 'mongoid'

class Student
  include Mongoid::Document

  belongs_to :group

  field :facebookId, :type => String
  field :expertLevel, :type => Integer, :default => 0
end